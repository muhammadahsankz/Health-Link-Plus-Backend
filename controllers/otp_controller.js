
const axios = require('axios');
const { generateOtp } = require('../utils/otp_utils');

const otpStore = {}; // simple in-memory store for demo, use DB in production

// ✅ Send OTP
exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = generateOtp(6);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    otpStore[email] = { otp, expiresAt };

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { name: "Health Link Plus", email: "kabirburiro6@gmail.com" },
                to: [{ email }],
                subject: "Health Link Plus OTP",
                htmlContent: `<p>Your Health Link Plus OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error(err.response?.data || err.message);
        return res.status(500).json({ error: "Failed to send OTP" });
    }
};

// ✅ Verify OTP
exports.verifyOtp = (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: "No OTP sent to this email" });

    if (record.expiresAt < Date.now()) {
        delete otpStore[email];
        return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    // OTP verified
    delete otpStore[email]; // remove OTP after successful verification
    return res.status(200).json({ message: "OTP verified successfully" });
};
