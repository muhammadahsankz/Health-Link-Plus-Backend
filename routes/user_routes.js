// routes/userRoutes.js
const express = require('express');
const {
    signupUser,
    loginUser,
    getPendingUsers,
    getApprovedUsers,
    approveUser,
    getDoctors,
    getPatients,
} = require('../controllers/user_controller');

const router = express.Router();

// POST /api/users/signup
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/get-pending-users-list', getPendingUsers);
router.get('/get-approved-users-list', getApprovedUsers);
router.post('/approve-user', approveUser);
router.get('/get-doctors-list', getDoctors);
router.get('/get-patients-list', getPatients);

module.exports = router;
