const User = require("../models/user_model");
const Clinic = require("../models/clinic_model");
const CONSTANTS = require("../utils/constants");
const Appointment = require("../models/appointment_model");

// GET all doctors with complete profiles and their clinic info
exports.getAllDoctorsListForPatient = async (req, res) => {
    try {
        // find all doctors who have 100% completed profiles and are approved
        const doctors = await User.find({
            role: CONSTANTS.ROLES.DOCTOR,
            approvalStatus: CONSTANTS.APPROVAL_STATUS.APPROVED,
            profileCompleted: 100
        }).select("-password"); // don't send password

        if (!doctors.length) {
            return res.status(200).json({ success: true, doctors: [] });
        }

        // Fetch clinic data for each doctor
        const doctorList = await Promise.all(
            doctors.map(async (doc) => {
                const clinic = await Clinic.findOne({ doctorId: doc._id.toString() });
                return {
                    _id: doc._id,
                    name: doc.name,
                    email: doc.email,
                    gender: doc.gender,
                    phone: doc.phone,
                    age: doc.age,
                    qualifications: doc.qualifications,
                    specialization: doc.specialization,
                    experience: doc.experience,
                    bio: doc.bio,
                    clinic: clinic
                        ? {
                            clinicName: clinic.clinicName,
                            clinicAddress: clinic.clinicAddress,
                            clinicContact: clinic.clinicContact,
                            clinicCity: clinic.clinicCity,
                            clinicNotes: clinic.clinicNotes,
                            weeklyTimings: clinic.weeklyTimings,
                        }
                        : null,
                };
            })
        );

        return res.status(200).json({
            success: true,
            doctors: doctorList,
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching doctors",
            error: error.message,
        });
    }
};


// 📅 Request an appointment
exports.requestAnAppointment = async (req, res) => {
    try {
        const { doctorId, patientId, appointmentDate, appointmentTime, notes } =
            req.body;

        if (!doctorId || !patientId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // ✅ Validate doctor and patient
        const doctor = await User.findById(doctorId);
        const patient = await User.findById(patientId);

        if (!doctor || doctor.role !== CONSTANTS.ROLES.DOCTOR) {
            return res
                .status(404)
                .json({ success: false, message: "Doctor not found or invalid" });
        }
        if (!patient || patient.role !== CONSTANTS.ROLES.PATIENT) {
            return res
                .status(404)
                .json({ success: false, message: "Patient not found or invalid" });
        }

        // Check clinic (optional)
        const clinic = await Clinic.findOne({ doctorId });

        // Create new appointment
        const newAppointment = new Appointment({
            doctorId,
            patientId,
            clinicId: clinic?._id,
            appointmentDate,
            appointmentTime,
            notes,
        });

        await newAppointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment request sent successfully",
            appointment: newAppointment,
        });
    } catch (error) {
        console.error("Error booking appointment:", error);
        return res.status(500).json({
            success: false,
            message: "Error booking appointment",
            error: error.message,
        });
    }
};


// 📋 Get Appointments for a Patient
exports.getPatientAppointments = async (req, res) => {
    try {
        const { patientId } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required",
            });
        }

        // Find all appointments of this patient
        const appointments = await Appointment.find({ patientId })
            .populate("doctorId", "name specialization phone") // only needed doctor fields
            .populate("clinicId", "clinicName clinicAddress clinicCity") // clinic info
            .sort({ appointmentDate: -1 });

        if (!appointments.length) {
            return res.status(200).json({ success: true, appointments: [] });
        }

        const formatted = appointments.map((appt) => ({
            id: appt._id,
            doctor: appt.doctorId ? appt.doctorId.name : "Unknown Doctor",
            specialization: appt.doctorId ? appt.doctorId.specialization : "",
            clinic: appt.clinicId
                ? `${appt.clinicId.clinicName}, ${appt.clinicId.clinicCity}`
                : "N/A",
            date: appt.appointmentDate,
            time: appt.appointmentTime,
            notes: appt.notes || "",
            status: appt.status || CONSTANTS.APPOINTMENT_STATUS.PENDING,
        }));

        return res.status(200).json({
            success: true,
            appointments: formatted,
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching appointments",
            error: error.message,
        });
    }
};

