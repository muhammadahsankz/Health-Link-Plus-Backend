// server.js 
const express = require('express');
require('dotenv').config();
const connectDB = require('./config/mongo_db');
const createDefaultAdmin = require('./utils/create_default_admin');
const cors = require('cors');

const app = express();

// Allow Cors
app.use(cors());

// Middleware
app.use(express.json());

// Connect to DB
connectDB();

createDefaultAdmin();


// Routes
app.use('/api/users', require('./routes/user_routes'));
app.use('/api/otp', require('./routes/otp_routes'));
app.use('/api/doctor', require('./routes/doctor_routes'));
app.use('/api/patient', require('./routes/patient_routes'));
app.get('/', (req, res) => {
    res.send('Hello from Health Link + Backend!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT:${PORT}`);
});
