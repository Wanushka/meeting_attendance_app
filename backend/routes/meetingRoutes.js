const express = require('express');
const MeetingController = require('../controllers/meetingController');
const AttendanceController = require('../controllers/attendanceController');

const router = express.Router();

// GET /api/meetings - Get all meetings
router.get('/', MeetingController.getAllMeetings);

// POST /api/meetings - Create new meeting
router.post('/', MeetingController.createMeeting);

// GET /api/meetings/:id/attendance - Get attendance for a meeting
router.get('/:id/attendance', AttendanceController.getMeetingAttendance);

module.exports = router;
router.get('/:id', MeetingController.getMeetingById);

// GET /api/meetings/:id