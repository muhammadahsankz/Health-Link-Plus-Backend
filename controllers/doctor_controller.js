const User = require("../models/user_model");
const Clinic = require("../models/clinic_model");
const Appointment = require("../models/appointment_model");
const CONSTANTS = require("../utils/constants");

// ✅ Complete Doctor Profile
exports.completeDoctorProfile = async (req, res) => {
    try {
        const {
            userId,
            specialization,
            qualifications,
            experience,
            phone,
            age,
            gender,
            bio,
        } = req.body;

        // Validate required fields
        if (!specialization || !qualifications || !experience || !phone || !age || !gender) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        // Find existing user
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Only update profileCompleted if less than 50 or not set
        let profileCompleted = existingUser.profileCompleted ?? 0;
        if (profileCompleted < 50) profileCompleted = 50;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                specialization,
                qualifications,
                experience,
                phone,
                age,
                gender,
                bio,
                profileCompleted,
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Doctor profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ✅ GET doctor profile by ID
exports.getDoctorProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const doctor = await User.findById(userId).select(
            'name email role specialization qualifications experience phone age gender bio'
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({
            success: true,
            doctor,
        });
    } catch (err) {
        console.error('Error fetching doctor profile:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile',
        });
    }
};



// ✅ GET Clinic by doctorId
exports.getClinic = async (req, res) => {
    try {
        const { doctorId } = req.body;
        const clinic = await Clinic.findOne({ doctorId });

        if (!clinic) {
            return res.status(404).json({
                success: false,
                clinic: null,
                message: 'No clinic found for this doctor',
            });
        }

        res.status(200).json({ success: true, clinic });
    } catch (err) {
        console.error('Error fetching clinic:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ✅ POST or UPDATE Clinic
exports.saveClinic = async (req, res) => {
    try {
        const {
            doctorId,
            clinicName,
            clinicAddress,
            clinicContact,
            clinicCity,
            clinicNotes,
            weeklyTimings,
        } = req.body;

        // 1️⃣ Check if doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // 2️⃣ Check if profile is at least 50% complete
        if (doctor.profileCompleted < 50) {
            return res.status(400).json({
                success: false,
                message: 'Complete at least 50% of your profile before adding a clinic.',
            });
        }

        // 3️⃣ Upsert clinic (update if exists, else create)
        const updatedClinic = await Clinic.findOneAndUpdate(
            { doctorId },
            {
                doctorId,
                clinicName,
                clinicAddress,
                clinicContact,
                clinicCity,
                clinicNotes,
                weeklyTimings,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // 4️⃣ Update profile completion
        await User.findOneAndUpdate(
            { _id: doctorId },
            {
                profileCompleted: 100,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Clinic saved successfully',
            clinic: updatedClinic,
        });
    } catch (err) {
        console.error('Error saving clinic:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// ✅ GET Doctor Appointments
exports.getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.body;

        if (!doctorId) {
            return res
                .status(400)
                .json({ success: false, message: "Doctor ID is required" });
        }

        const appointments = await Appointment.find({ doctorId: doctorId.toString() })
            .populate("patientId", "name email phone")
            .populate("clinicId", "clinicName clinicCity")
            .sort({ appointmentDate: -1 });

        if (!appointments.length) {
            return res.status(200).json({ success: true, appointments: [] });
        }

        const formatted = appointments.map((appt) => ({
            id: appt._id,
            patient: appt.patientId ? appt.patientId.name : "Unknown",
            patientPhone: appt.patientId ? appt.patientId.phone : "N/A",
            date: appt.appointmentDate,
            time: appt.appointmentTime,
            clinic: appt.clinicId
                ? `${appt.clinicId.clinicName}, ${appt.clinicId.clinicCity}`
                : "N/A",
            notes: appt.notes || "",
            status: appt.status || CONSTANTS.APPOINTMENT_STATUS.PENDING,
        }));

        return res.status(200).json({
            success: true,
            appointments: formatted,
        });
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching appointments",
            error: error.message,
        });
    }
};

// ✅ Accept Appointment
exports.acceptAppointment = async (req, res) => {
    try {
        const { appointmentId, doctorId } = req.body;

        if (!appointmentId || !doctorId) {
            return res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
        }

        const appointment = await Appointment.findOne({ _id: appointmentId, doctorId });

        if (!appointment) {
            return res
                .status(404)
                .json({ success: false, message: "Appointment not found" });
        }

        if (appointment.status === CONSTANTS.APPOINTMENT_STATUS.APPROVED) {
            return res
                .status(400)
                .json({ success: false, message: "Appointment already accepted" });
        }

        appointment.status = CONSTANTS.APPOINTMENT_STATUS.APPROVED;
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment accepted successfully",
            appointment,
        });
    } catch (error) {
        console.error("Error accepting appointment:", error);
        return res.status(500).json({
            success: false,
            message: "Error accepting appointment",
            error: error.message,
        });
    }
};
