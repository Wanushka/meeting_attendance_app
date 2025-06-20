const Meeting = require('../models/Meeting');
const MeetingParticipant = require('../models/MeetingParticipant');
const Employee = require('../models/Employee');
const ResponseFormatter = require('../utils/responseFormatter');
const QRCodeService = require('../services/qrCodeService');
const EmailService = require('../services/emailService');
const crypto = require('crypto');

class MeetingController {
  static getAllMeetings(req, res) {
    Meeting.getAll((err, results) => {
      if (err) {
        console.error('Error fetching meetings:', err);
        return ResponseFormatter.error(res, 'Failed to fetch meetings', 500);
      }
      ResponseFormatter.success(res, results);
    });
  }

  static async createMeeting(req, res) {
    const { name, purpose, meeting_date, participant_ids } = req.body;
    
    if (!name || !meeting_date) {
      return ResponseFormatter.error(res, 'Name and meeting date are required', 400);
    }
    
    try {
      // Generate QR code for meeting
      const meetingQRData = `meeting:${crypto.randomUUID()}`;
      const qrCodeDataURL = await QRCodeService.generateQRCode(meetingQRData);
      
      // Create meeting
      Meeting.create({ name, purpose, meeting_date, qr_code: meetingQRData }, async (err, result) => {
        if (err) {
          console.error('Error creating meeting:', err);
          return ResponseFormatter.error(res, 'Failed to create meeting', 500);
        }
        
        const meetingId = result.insertId;
        
        // Add participants and send QR codes
        if (participant_ids && participant_ids.length > 0) {
          for (const employeeId of participant_ids) {
            const qrToken = crypto.randomUUID();
            
            // Create participant
            MeetingParticipant.create({
              meeting_id: meetingId,
              employee_id: employeeId,
              qr_token: qrToken
            }, (err) => {
              if (err) {
                console.error('Error adding participant:', err);
                return;
              }
              
              // Send email to participant
              Employee.findById(employeeId, async (err, employees) => {
                if (err || !employees.length || !employees[0].email) return;
                
                const employee = employees[0];
                const participantQRData = `participant:${qrToken}:${meetingId}`;
                
                try {
                  await EmailService.sendMeetingInvitation(
                    employee,
                    { name, purpose, meeting_date },
                    participantQRData
                  );
                  
                  // Update email sent status
                  MeetingParticipant.updateEmailSent(meetingId, employeeId, () => {});
                  
                } catch (emailErr) {
                  console.error('Error sending email:', emailErr);
                }
              });
            });
          }
        }
        
        ResponseFormatter.success(res, {
          id: meetingId,
          name,
          purpose,
          meeting_date,
          qr_code: meetingQRData,
          qr_code_image: qrCodeDataURL
        }, 201);
      });
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      ResponseFormatter.error(res, 'Failed to create meeting', 500);
    }
  }

  static getMeetingById(req, res) {
    const meetingId = req.params.id;
    
    Meeting.findById(meetingId, (err, results) => {
      if (err) {
        console.error('Error fetching meeting:', err);
        return ResponseFormatter.error(res, 'Failed to fetch meeting', 500);
      }
      
      if (results.length === 0) {
        return ResponseFormatter.error(res, 'Meeting not found', 404);
      }
      
      const meeting = results[0];
      meeting.participants = meeting.participants ? JSON.parse(`[${meeting.participants}]`) : [];
      
      ResponseFormatter.success(res, meeting);
    });
  }
}

module.exports = MeetingController;