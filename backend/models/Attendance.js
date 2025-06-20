const db = require('../config/database');

class Attendance {
  static create(attendanceData, callback) {
    const { meeting_id, employee_id, participant_id, name, email, position, is_registered_employee } = attendanceData;
    const query = `
      INSERT INTO attendance (meeting_id, employee_id, participant_id, name, email, position, is_registered_employee)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [meeting_id, employee_id, participant_id, name, email, position, is_registered_employee], callback);
  }

  static checkExisting(meetingId, employeeId, callback) {
    const query = 'SELECT id FROM attendance WHERE meeting_id = ? AND employee_id = ?';
    db.query(query, [meetingId, employeeId], callback);
  }

  static getByMeetingId(meetingId, callback) {
    const query = `
      SELECT a.*, m.name as meeting_name
      FROM attendance a
      JOIN meetings m ON a.meeting_id = m.id
      WHERE a.meeting_id = ?
      ORDER BY a.attendance_time DESC
    `;
    db.query(query, [meetingId], callback);
  }

  static getTotalCount(callback) {
    const query = 'SELECT COUNT(*) as count FROM attendance';
    db.query(query, callback);
  }
}

module.exports = Attendance;