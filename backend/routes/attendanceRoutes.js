const express = require('express');
const AttendanceController = require('../controllers/attendanceController');

const router = express.Router();

// POST /api/attendance/scan - Scan QR code for attendance
router.post('/scan', AttendanceController.scanQRCode);

module.exports = router;