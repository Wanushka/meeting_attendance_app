const db = require('../config/database');

class MeetingParticipant {
  static create(participantData, callback) {
    const { meeting_id, employee_id, qr_token } = participantData;
    const query = 'INSERT INTO meeting_participants (meeting_id, employee_id, qr_token) VALUES (?, ?, ?)';
    db.query(query, [meeting_id, employee_id, qr_token], callback);
  }

  static findByToken(qrToken, meetingId, callback) {
    const query = `
      SELECT mp.*, e.name, e.email, e.position, m.name as meeting_name
      FROM meeting_participants mp
      JOIN employees e ON mp.employee_id = e.id
      JOIN meetings m ON mp.meeting_id = m.id
      WHERE mp.qr_token = ? AND mp.meeting_id = ?
    `;
    db.query(query, [qrToken, meetingId], callback);
  }

  static updateEmailSent(meetingId, employeeId, callback) {
    const query = 'UPDATE meeting_participants SET email_sent = TRUE WHERE meeting_id = ? AND employee_id = ?';
    db.query(query, [meetingId, employeeId], callback);
  }
}

module.exports = MeetingParticipant;