// routes/userRoutes.js
const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/otp_controller');

const router = express.Router();

// POST /api/users/signup
router.post('/send', sendOtp);
router.post('/verify', verifyOtp);

module.exports = router;
