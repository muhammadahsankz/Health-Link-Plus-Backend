// utils/create_default_admin.js
const User = require('../models/user_model');
const CONSTANTS = require('../utils/constants');
require('dotenv').config();

async function createDefaultAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: CONSTANTS.ROLES.ADMIN });
        if (existingAdmin) {
            console.log('✅ Admin already exists.');
            return;
        }

        // Create admin from .env values
        const adminData = {
            name: process.env.ADMIN_NAME || 'Default Admin',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: CONSTANTS.ROLES.ADMIN,
            approvalStatus: CONSTANTS.APPROVAL_STATUS.APPROVED,
        };

        if (!adminData.email || !adminData.password) {
            console.log('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env file.');
            return;
        }

        const newAdmin = new User(adminData);
        await newAdmin.save();
        console.log('🚀 Default admin account created successfully!');
    } catch (error) {
        console.error('❌ Error creating default admin:', error.message);
    }
}

module.exports = createDefaultAdmin;
