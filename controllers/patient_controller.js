const User = require("../models/user_model");
const Clinic = require("../models/clinic_model");
const CONSTANTS = require("../utils/constants");

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
