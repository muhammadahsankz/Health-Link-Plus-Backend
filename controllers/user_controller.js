const User = require('../models/user_model');
const jwt = require("jsonwebtoken");
const validator = require("validator");
const CONSTANTS = require("../utils/constants");
require("dotenv").config();

// ✅ Signup
exports.signupUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Create new user
        const newUser = new User({ name, email, password, role });
        await newUser.save();

        return res.status(200).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                approvalStatus: newUser.approvalStatus,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// ✅ Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // ⚠️ Check approval status (only for doctors)
        if (user.role === CONSTANTS.ROLES.DOCTOR && user.approvalStatus === CONSTANTS.APPROVAL_STATUS.PENDING) {
            return res.status(403).json({
                message: "Your account is awaiting admin approval.",
                status: "pending",
            });
        }

        // ✅ Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_TOKEN
            // { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};


// ✅ Get all pending users
exports.getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({
            approvalStatus: CONSTANTS.APPROVAL_STATUS.PENDING,
            role: { $ne: CONSTANTS.ROLES.ADMIN } // exclude admin
        });
        return res.status(200).json({ users: pendingUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get all approved users
exports.getApprovedUsers = async (req, res) => {
    try {
        const approvedUsers = await User.find({
            approvalStatus: CONSTANTS.APPROVAL_STATUS.APPROVED,
            role: { $ne: CONSTANTS.ROLES.ADMIN } // exclude admin
        });
        return res.status(200).json({ users: approvedUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// ✅ Update user approval status to Approved
exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.approvalStatus = CONSTANTS.APPROVAL_STATUS.APPROVED;
        await user.save();

        return res.status(200).json({ message: "User approved successfully", user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};


// ✅ Get all users with role Doctor
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({
            role: CONSTANTS.ROLES.DOCTOR,
        });
        return res.status(200).json({ users: doctors });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get all users with role Patient
exports.getPatients = async (req, res) => {
    try {
        const patients = await User.find({
            role: CONSTANTS.ROLES.PATIENT,
        });
        return res.status(200).json({ users: patients });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};
