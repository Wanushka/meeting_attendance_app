const Attendance = require('../models/Attendance');
const MeetingParticipant = require('../models/MeetingParticipant');
const Meeting = require('../models/Meeting');
const ResponseFormatter = require('../utils/responseFormatter');

class AttendanceController {
  static scanQRCode(req, res) {
    const { qr_data, name, email, position } = req.body;
    
    if (!qr_data) {
      return ResponseFormatter.error(res, 'QR code data is required', 400);
    }
    
    // Parse QR code data
    if (qr_data.startsWith('participant:')) {
      AttendanceController.handleParticipantQR(req, res, qr_data);
    } else if (qr_data.startsWith('meeting:')) {
      AttendanceController.handleMeetingQR(req, res, qr_data, { name, email, position });
    } else {
      ResponseFormatter.error(res, 'Invalid QR code format', 400);
    }
  }

  static handleParticipantQR(req, res, qr_data) {
    const [, qrToken, meetingId] = qr_data.split(':');
    
    // Find participant
    MeetingParticipant.findByToken(qrToken, meetingId, (err, participants) => {
      if (err) {
        console.error('Error finding participant:', err);
        return ResponseFormatter.error(res, 'Failed to process attendance', 500);
      }
      
      if (participants.length === 0) {
        return ResponseFormatter.error(res, 'Invalid QR code or participant not found', 404);
      }
      
      const participant = participants[0];
      
      // Check if already marked attendance
      Attendance.checkExisting(meetingId, participant.employee_id, (err, existing) => {
        if (err) {
          console.error('Error checking attendance:', err);
          return ResponseFormatter.error(res, 'Failed to process attendance', 500);
        }
        
        if (existing.length > 0) {
          return ResponseFormatter.error(res, 'Attendance already marked', 400);
        }
        
        // Mark attendance
        const attendanceData = {
          meeting_id: meetingId,
          employee_id: participant.employee_id,
          participant_id: participant.id,
          name: participant.name,
          email: participant.email,
          position: participant.position,
          is_registered_employee: true
        };
        
        Attendance.create(attendanceData, (err) => {
          if (err) {
            console.error('Error marking attendance:', err);
            return ResponseFormatter.error(res, 'Failed to mark attendance', 500);
          }
          
          ResponseFormatter.success(res, {
            message: 'Attendance marked successfully',
            meeting: participant.meeting_name,
            participant: participant.name
          });
        });
      });
    });
  }

  static handleMeetingQR(req, res, qr_data, participantInfo) {
    const { name, email, position } = participantInfo;
    
    if (!name) {
      return ResponseFormatter.error(res, 'Name is required for new participants', 400);
    }
    
    // Find meeting
    Meeting.findByQRCode(qr_data, (err, meetings) => {
      if (err) {
        console.error('Error finding meeting:', err);
        return ResponseFormatter.error(res, 'Failed to process attendance', 500);
      }
      
      if (meetings.length === 0) {
        return ResponseFormatter.error(res, 'Invalid meeting QR code', 404);
      }
      
      const meeting = meetings[0];
      
      // Mark attendance for new participant
      const attendanceData = {
        meeting_id: meeting.id,
        employee_id: null,
        participant_id: null,
        name,
        email: email || null,
        position: position || null,
        is_registered_employee: false
      };
      
      Attendance.create(attendanceData, (err) => {
        if (err) {
          console.error('Error marking attendance:', err);
          return ResponseFormatter.error(res, 'Failed to mark attendance', 500);
        }
        
        ResponseFormatter.success(res, {
          message: 'Welcome! Attendance marked successfully',
          meeting: meeting.name,
          participant: name
        });
      });
    });
  }

  static getMeetingAttendance(req, res) {
    const meetingId = req.params.id;
    
    Attendance.getByMeetingId(meetingId, (err, results) => {
      if (err) {
        console.error('Error fetching attendance:', err);
        return ResponseFormatter.error(res, 'Failed to fetch attendance', 500);
      }
      ResponseFormatter.success(res, results);
    });
  }
}

module.exports = AttendanceController;