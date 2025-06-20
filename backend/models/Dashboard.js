const db = require('../config/database');

class Dashboard {
  static getTotalEmployees(callback) {
    const query = 'SELECT COUNT(*) as count FROM employees';
    db.query(query, callback);
  }

  static getTotalMeetings(callback) {
    const query = 'SELECT COUNT(*) as count FROM meetings';
    db.query(query, callback);
  }

  static getUpcomingMeetings(callback) {
    const query = 'SELECT COUNT(*) as count FROM meetings WHERE meeting_date > NOW() AND status = "scheduled"';
    db.query(query, callback);
  }

  static getTotalAttendance(callback) {
    const query = 'SELECT COUNT(*) as count FROM attendance';
    db.query(query, callback);
  }
}

module.exports = Dashboard;