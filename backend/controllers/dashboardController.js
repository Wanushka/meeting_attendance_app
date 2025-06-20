const Dashboard = require('../models/Dashboard');
const ResponseFormatter = require('../utils/responseFormatter');

class DashboardController {
  static getStats(req, res) {
    const stats = {};
    let completed = 0;
    const totalQueries = 4;
    
    const checkComplete = () => {
      completed++;
      if (completed === totalQueries) {
        ResponseFormatter.success(res, stats);
      }
    };
    
    Dashboard.getTotalEmployees((err, results) => {
      stats.totalEmployees = (!err && results.length > 0) ? results[0].count : 0;
      checkComplete();
    });
    
    Dashboard.getTotalMeetings((err, results) => {
      stats.totalMeetings = (!err && results.length > 0) ? results[0].count : 0;
      checkComplete();
    });
    
    Dashboard.getUpcomingMeetings((err, results) => {
      stats.upcomingMeetings = (!err && results.length > 0) ? results[0].count : 0;
      checkComplete();
    });
    
    Dashboard.getTotalAttendance((err, results) => {
      stats.totalAttendance = (!err && results.length > 0) ? results[0].count : 0;
      checkComplete();
    });
  }
}

module.exports = DashboardController;