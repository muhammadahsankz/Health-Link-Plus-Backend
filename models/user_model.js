const mongoose = require('mongoose');
const CONSTANTS = require('../utils/constants');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: [CONSTANTS.ROLES.PATIENT, CONSTANTS.ROLES.DOCTOR, CONSTANTS.ROLES.ADMIN],
            required: true
        },
        approvalStatus: {
            type: String,
            enum: [CONSTANTS.APPROVAL_STATUS.PENDING, CONSTANTS.APPROVAL_STATUS.APPROVED],
            default: function () {
                return this.role === CONSTANTS.ROLES.DOCTOR ? CONSTANTS.APPROVAL_STATUS.PENDING : CONSTANTS.APPROVAL_STATUS.APPROVED;
            }
        },
        profileCompleted: {
            type: Number,
            default: function () {
                return this.role === CONSTANTS.ROLES.DOCTOR ? 10 : 100;
            }
        },

        // 🩺 Doctor-specific fields
        specialization: { type: String },
        qualifications: { type: String },
        experience: { type: String },
        phone: { type: String },
        age: { type: String },
        gender: { type: String },
        bio: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
