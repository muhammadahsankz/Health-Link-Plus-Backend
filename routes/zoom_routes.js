// routes/zoom_routes.js
const express = require('express');
const router = express.Router();
const { generateSignature, createMeeting } = require('../controllers/zoom_controller');

// Create meeting
router.post('/create', createMeeting);

// Generate SDK signature
router.post('/signature', generateSignature);

module.exports = router;
