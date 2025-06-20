const db = require('../config/database');

// Create tables
const createEmployeesTable = `
  CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    position VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const createMeetingsTable = `
  CREATE TABLE IF NOT EXISTS meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    purpose TEXT,
    meeting_date DATETIME NOT NULL,
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('scheduled', 'active', 'completed') DEFAULT 'scheduled'
  )
`;

const createMeetingParticipantsTable = `
  CREATE TABLE IF NOT EXISTS meeting_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT,
    employee_id INT,
    qr_token VARCHAR(255) UNIQUE,
    email_sent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  )
`;

const createAttendanceTable = `
  CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT,
    employee_id INT,
    participant_id INT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    position VARCHAR(255),
    attendance_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_registered_employee BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (participant_id) REFERENCES meeting_participants(id) ON DELETE SET NULL
  )
`;

const initializeTables = () => {
  const tables = [createEmployeesTable, createMeetingsTable, createMeetingParticipantsTable, createAttendanceTable];
  
  tables.forEach(query => {
    db.query(query, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
    });
  });
};

module.exports = { initializeTables };