const mongoose = require("mongoose");
const CONSTANTS = require("../utils/constants");

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: String,
        ref: "User",
        required: true,
    },
    patientId: {
        type: String,
        ref: "User",
        required: true,
    },
    clinicId: {
        type: String,
        ref: "Clinic",
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    appointmentTime: {
        type: String,
        required: true, // e.g. "10:30 AM"
    },
    status: {
        type: String,
        enum: [CONSTANTS.APPOINTMENT_STATUS.PENDING, CONSTANTS.APPOINTMENT_STATUS.APPROVED, CONSTANTS.APPOINTMENT_STATUS.REJECTED, CONSTANTS.APPOINTMENT_STATUS.COMPLETED],
        default: CONSTANTS.APPOINTMENT_STATUS.PENDING,
    },
    notes: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
