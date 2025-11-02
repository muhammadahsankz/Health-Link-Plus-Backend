// routes/doctorRoutes.js
const express = require('express');
const {
    completeDoctorProfile,
    getDoctorProfile,
    getClinic,
    saveClinic,
    getDoctorAppointments,
    acceptAppointment,
} = require('../controllers/doctor_controller');
const router = express.Router();

router.post('/complete-doctor-profile', completeDoctorProfile);
router.post('/get-doctor-profile', getDoctorProfile);
router.post('/get-clinic-data', getClinic);
router.post('/save-clinic-data', saveClinic);
router.post('/get-doctor-appointments', getDoctorAppointments);
router.post('/accept-appointment', acceptAppointment);

module.exports = router;
