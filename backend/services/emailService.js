const transporter = require('../config/email');
const QRCodeService = require('./qrCodeService');

class EmailService {
  static async sendMeetingInvitation(employee, meeting, participantQRData) {
    try {
      // Generate participant QR code
      const participantQRCodeDataURL = await QRCodeService.generateQRCode(participantQRData);
      
      // Send email with QR code
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: `Meeting Invitation: ${meeting.name}`,
        html: `
          <h2>Meeting Invitation</h2>
          <p>Hello ${employee.name},</p>
          <p>You have been invited to attend the meeting: <strong>${meeting.name}</strong></p>
          <p><strong>Purpose:</strong> ${meeting.purpose || 'Not specified'}</p>
          <p><strong>Date:</strong> ${new Date(meeting.meeting_date).toLocaleString()}</p>
          <p>Please scan the QR code below to mark your attendance:</p>
          <img src="${participantQRCodeDataURL}" alt="QR Code" />
          <p>Best regards,<br>Meeting Management System</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      throw new Error('Failed to send email: ' + error.message);
    }
  }
}

module.exports = EmailService;