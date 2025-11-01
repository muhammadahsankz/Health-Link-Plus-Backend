// models/clinic_model.js
const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
    {
        doctorId: { type: String, required: true },
        clinicName: { type: String, required: true },
        clinicAddress: { type: String, required: true },
        clinicContact: { type: String, required: true },
        clinicCity: { type: String, required: true },
        clinicNotes: { type: String },
        weeklyTimings: {
            type: Map,
            of: {
                open: { type: String },
                close: { type: String },
            },
            default: {},
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Clinic', clinicSchema);
