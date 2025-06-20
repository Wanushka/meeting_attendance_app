const db = require('../config/database');

class Meeting {
  static getAll(callback) {
    const query = `
      SELECT m.*, 
             COUNT(DISTINCT mp.id) as participant_count,
             COUNT(DISTINCT a.id) as attendance_count
      FROM meetings m
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
      LEFT JOIN attendance a ON m.id = a.meeting_id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `;
    db.query(query, callback);
  }

  static create(meetingData, callback) {
    const { name, purpose, meeting_date, qr_code } = meetingData;
    const query = 'INSERT INTO meetings (name, purpose, meeting_date, qr_code) VALUES (?, ?, ?, ?)';
    db.query(query, [name, purpose, meeting_date, qr_code], callback);
  }

  static findById(id, callback) {
    const query = `
      SELECT m.*,
             GROUP_CONCAT(
               JSON_OBJECT(
                 'id', e.id,
                 'name', e.name,
                 'email', e.email,
                 'position', e.position,
                 'qr_token', mp.qr_token,
                 'email_sent', mp.email_sent
               )
             ) as participants
      FROM meetings m
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
      LEFT JOIN employees e ON mp.employee_id = e.id
      WHERE m.id = ?
      GROUP BY m.id
    `;
    db.query(query, [id], callback);
  }

  static findByQRCode(qrCode, callback) {
    const query = 'SELECT * FROM meetings WHERE qr_code = ?';
    db.query(query, [qrCode], callback);
  }
}

module.exports = Meeting;