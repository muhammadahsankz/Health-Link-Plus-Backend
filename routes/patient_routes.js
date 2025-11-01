// routes/doctorRoutes.js
const express = require('express');
const {
    getAllDoctorsListForPatient,
} = require('../controllers/patient_controller');
const router = express.Router();

router.get('/get-all-doctors-list-for-patient', getAllDoctorsListForPatient);

module.exports = router;
