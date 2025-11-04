// controllers/zoom_controller.js
const axios = require('axios');
const crypto = require('crypto');
const Appointment = require('../models/appointment_model');
require('dotenv').config();


// Generate Meeting SDK Signature
const generateSignature = async (req, res) => {
    try {
        const { meetingNumber, role } = req.body;

        const iat = Math.floor(Date.now() / 1000) - 30;
        const exp = iat + 60 * 60 * 2; // valid for 2 hours
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            sdkKey: process.env.ZOOM_MEETING_SDK_CLIENT_ID,
            mn: meetingNumber,
            role,
            iat,
            exp,
            appKey: process.env.ZOOM_MEETING_SDK_CLIENT_ID,
            tokenExp: exp,
        };

        const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const signature = crypto
            .createHmac('sha256', process.env.ZOOM_MEETING_SDK_CLIENT_SECRET)
            .update(`${base64Header}.${base64Payload}`)
            .digest('base64url');

        const jwt = `${base64Header}.${base64Payload}.${signature}`;

        res.status(200).json({ signature: jwt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error generating signature' });
    }
};

// Generate Access Token using Server-to-Server OAuth
const getAccessToken = async () => {
    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;

    const authHeader = Buffer.from(
        `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');

    try {
        const response = await axios.post(tokenUrl, null, {
            headers: {
                Authorization: `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data.access_token;
    } catch (err) {
        console.error('Zoom Auth Error:', err.response?.data || err.message);
        throw new Error('Failed to get access token from Zoom');
    }
};

// Create Zoom Meeting (Doctor initiates)
const createMeeting = async (req, res) => {
    try {
        const { topic, start_time, duration, doctorEmail, appointmentId } = req.body;

        const accessToken = await getAccessToken();

        const meeting = await axios.post(
            `https://api.zoom.us/v2/users/me/meetings`,
            {
                topic,
                type: 2, // scheduled meeting
                start_time,
                duration,
                timezone: 'UTC',
                settings: {
                    join_before_host: true,
                    approval_type: 0,
                    registration_type: 1,
                    audio: 'both',
                    auto_recording: 'none',
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // ✅ SAVE MEETING INFO TO APPOINTMENT
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
                zoomMeetingId: meeting.data.id,
                zoomJoinUrl: meeting.data.join_url,
                zoomStartUrl: meeting.data.start_url,
            },
            { new: true } // Return updated document
        );

        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.status(200).json({
            meetingId: meeting.data.id,
            join_url: meeting.data.join_url,
            start_url: meeting.data.start_url,
        });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'Error creating Zoom meeting' });
    }
};

module.exports = {
    generateSignature,
    createMeeting,
};
