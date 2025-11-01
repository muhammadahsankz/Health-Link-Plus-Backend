// routes/doctorRoutes.js
const express = require('express');
const {
    completeDoctorProfile,
    getDoctorProfile,
    getClinic,
    saveClinic,
} = require('../controllers/doctor_controller');
const router = express.Router();

router.post('/complete-doctor-profile', completeDoctorProfile);
router.post('/get-doctor-profile', getDoctorProfile);
router.post('/get-clinic-data', getClinic);
router.post('/save-clinic-data', saveClinic);

module.exports = router;
