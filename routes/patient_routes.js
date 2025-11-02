// routes/doctorRoutes.js
const express = require('express');
const {
    getAllDoctorsListForPatient,
    requestAnAppointment,
    getPatientAppointments,
    getMeetingDetails,
} = require('../controllers/patient_controller');
const router = express.Router();

router.get('/get-all-doctors-list-for-patient', getAllDoctorsListForPatient);
router.post('/request-an-appointment', requestAnAppointment);
router.post('/get-patient-appointments', getPatientAppointments);
router.post('/get-meeting-details', getMeetingDetails);

module.exports = router;
