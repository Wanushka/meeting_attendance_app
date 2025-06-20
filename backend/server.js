const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // MySQL username
  password: '', // MySQL password
  database: 'meeting_attendence_app' // database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// ✅ Add this part to define the table creation query
const createEmployeesTable = `
  CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    position VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create employees table if it doesn't exist
db.query(createEmployeesTable, (err) => {
  if (err) {
    console.error('Error creating employees table:', err);
  } else {
    console.log('Employees table ready');
  }
});

// Create meetings table if it doesn't exist
const createMeetingsTable = `
  CREATE TABLE IF NOT EXISTS meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create meeting_members table for many-to-many relationship
const createMeetingMembersTable = `
  CREATE TABLE IF NOT EXISTS meeting_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    employee_id INT NOT NULL,
    attendance_status ENUM('pending', 'attended', 'absent') DEFAULT 'pending',
    qr_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meeting_employee (meeting_id, employee_id)
  )
`;

// Create database tables
db.query(createMeetingsTable, (err) => {
  if (err) {
    console.error('Error creating meetings table:', err);
  } else {
    console.log('Meetings table ready');
  }
});

db.query(createMeetingMembersTable, (err) => {
  if (err) {
    console.error('Error creating meeting_members table:', err);
  } else {
    console.log('Meeting members table ready');
  }
});

// Get all employees
app.get('/api/employees', (req, res) => {
  const query = 'SELECT * FROM employees ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      res.status(500).json({ error: 'Failed to fetch employees' });
      return;
    }
    res.json(results);
  });
});

// Add new employee
app.post('/api/employees', (req, res) => {
  const { name, email, position } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const query = 'INSERT INTO employees (name, email, position) VALUES (?, ?, ?)';
  
  db.query(query, [name, email || null, position || null], (err, result) => {
    if (err) {
      console.error('Error adding employee:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'Employee with this email already exists' });
      } else {
        res.status(500).json({ error: 'Failed to add employee' });
      }
      return;
    }
    
    // Return the newly created employee
    const newEmployee = {
      id: result.insertId,
      name,
      email: email || null,
      position: position || null,
      created_at: new Date()
    };
    
    res.status(201).json(newEmployee);
  });
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;
  
  const query = 'DELETE FROM employees WHERE id = ?';
  
  db.query(query, [employeeId], (err, result) => {
    if (err) {
      console.error('Error deleting employee:', err);
      res.status(500).json({ error: 'Failed to delete employee' });
      return;
    }
    
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    
    res.json({ message: 'Employee deleted successfully' });
  });
});

// Get all meetings with their members
app.get('/api/meetings', (req, res) => {
  const query = `
    SELECT 
      m.id,
      m.title,
      m.purpose,
      m.date,
      m.time,
      m.created_at,
      e.id as employee_id,
      e.name as employee_name,
      e.email as employee_email,
      e.position as employee_position,
      mm.attendance_status,
      mm.qr_sent
    FROM meetings m
    LEFT JOIN meeting_members mm ON m.id = mm.meeting_id
    LEFT JOIN employees e ON mm.employee_id = e.id
    ORDER BY m.date DESC, m.time DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching meetings:', err);
      return res.status(500).json({ error: 'Failed to fetch meetings' });
    }
    
    // Group the results by meeting
    const meetingsMap = {};
    
    results.forEach(row => {
      const meetingId = row.id;
      
      // If this is the first time we've seen this meeting, add it to the map
      if (!meetingsMap[meetingId]) {
        meetingsMap[meetingId] = {
          id: row.id,
          title: row.title,
          purpose: row.purpose,
          date: row.date,
          time: row.time,
          created_at: row.created_at,
          members: []
        };
      }
      
      // Add the employee to the meeting's members list if employee exists
      if (row.employee_id) {
        meetingsMap[meetingId].members.push({
          id: row.employee_id,
          name: row.employee_name,
          email: row.employee_email,
          position: row.employee_position,
          attendance_status: row.attendance_status,
          qr_sent: row.qr_sent
        });
      }
    });
    
    // Convert the map to an array
    const meetingsArray = Object.values(meetingsMap);
    
    res.json(meetingsArray);
  });
});

// Create a new meeting
app.post('/api/meetings', (req, res) => {
  const { title, purpose, date, time, members } = req.body;
  
  if (!title || !purpose || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Start a transaction to ensure data integrity
  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Failed to create meeting' });
    }
    
    // Insert the meeting first
    const meetingQuery = 'INSERT INTO meetings (title, purpose, date, time) VALUES (?, ?, ?, ?)';
    
    db.query(meetingQuery, [title, purpose, date, time], (err, result) => {
      if (err) {
        console.error('Error creating meeting:', err);
        return db.rollback(() => {
          res.status(500).json({ error: 'Failed to create meeting' });
        });
      }
      
      const meetingId = result.insertId;
      
      // If there are no members, commit the transaction and return
      if (!members || members.length === 0) {
        return db.commit(err => {
          if (err) {
            console.error('Error committing transaction:', err);
            return db.rollback(() => {
              res.status(500).json({ error: 'Failed to create meeting' });
            });
          }
          
          res.status(201).json({ 
            id: meetingId,
            title,
            purpose,
            date,
            time,
            members: [],
            created_at: new Date()
          });
        });
      }
      
      // Add members to the meeting
      const memberValues = members.map(memberId => [meetingId, memberId]);
      const memberQuery = 'INSERT INTO meeting_members (meeting_id, employee_id) VALUES ?';
      
      db.query(memberQuery, [memberValues], (err) => {
        if (err) {
          console.error('Error adding meeting members:', err);
          return db.rollback(() => {
            res.status(500).json({ error: 'Failed to add meeting members' });
          });
        }
        
        // Commit the transaction
        db.commit(err => {
          if (err) {
            console.error('Error committing transaction:', err);
            return db.rollback(() => {
              res.status(500).json({ error: 'Failed to create meeting' });
            });
          }
          
          // Get the created meeting with members
          const getQuery = `
            SELECT m.*, JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', e.id,
                'name', e.name,
                'email', e.email,
                'position', e.position
              )
            ) as members
            FROM meetings m
            LEFT JOIN meeting_members mm ON m.id = mm.meeting_id
            LEFT JOIN employees e ON mm.employee_id = e.id
            WHERE m.id = ?
            GROUP BY m.id
          `;
          
          db.query(getQuery, [meetingId], (err, results) => {
            if (err || results.length === 0) {
              console.error('Error fetching created meeting:', err);
              return res.status(201).json({ 
                id: meetingId,
                title,
                purpose,
                date,
                time,
                created_at: new Date()
              });
            }
            
            const meeting = results[0];
            
            // Parse the members JSON string
            if (meeting.members === '[null]') {
              meeting.members = [];
            } else {
              try {
                meeting.members = JSON.parse(meeting.members);
              } catch (e) {
                meeting.members = [];
              }
            }
            
            res.status(201).json(meeting);
          });
        });
      });
    });
  });
});

// Send QR code to an employee for a specific meeting
app.post('/api/meetings/:meetingId/send-qr/:employeeId', (req, res) => {
  const { meetingId, employeeId } = req.params;
  
  // First, update the meeting_members table to mark QR as sent
  const updateQuery = `
    UPDATE meeting_members 
    SET qr_sent = TRUE 
    WHERE meeting_id = ? AND employee_id = ?
  `;
  
  db.query(updateQuery, [meetingId, employeeId], (err, result) => {
    if (err) {
      console.error('Error updating QR status:', err);
      return res.status(500).json({ error: 'Failed to update QR status' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Meeting member not found' });
    }
    
    // In a real application, you would generate and send the QR code here
    // For this example, we'll just simulate it with a success message
    
    res.json({ message: 'QR code sent successfully' });
  });
});

// Add members to an existing meeting
app.post('/api/meetings/:meetingId/members', (req, res) => {
  const { meetingId } = req.params;
  const { memberIds } = req.body;
  
  console.log(`Received request to add members to meeting ${meetingId}:`, memberIds);
  
  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ error: 'Member IDs are required' });
  }
  
  // First, verify the meeting exists
  db.query('SELECT * FROM meetings WHERE id = ?', [meetingId], (err, results) => {
    if (err) {
      console.error('Error checking meeting:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Process each member separately to better handle errors
    const addMembers = async () => {
      let addedCount = 0;
      
      for (const memberId of memberIds) {
        try {
          // Use promise to handle the query
          await new Promise((resolve, reject) => {
            const query = `
              INSERT INTO meeting_members (meeting_id, employee_id) 
              VALUES (?, ?)
              ON DUPLICATE KEY UPDATE attendance_status = attendance_status
            `;
            
            db.query(query, [meetingId, memberId], (err, result) => {
              if (err) {
                console.error(`Error adding member ${memberId}:`, err);
                reject(err);
              } else {
                addedCount += result.affectedRows > 0 ? 1 : 0;
                resolve(result);
              }
            });
          });
        } catch (err) {
          // Continue with other members even if one fails
          console.error(`Skipping problematic member ${memberId}`);
        }
      }
      
      return addedCount;
    };
    
    // Execute the async function to add members
    addMembers()
      .then(count => {
        res.json({ 
          message: `Successfully added ${count} members to meeting`, 
          addedCount: count 
        });
      })
      .catch(err => {
        console.error('Error in addMembers function:', err);
        res.status(500).json({ error: 'Failed to add members to meeting' });
      });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
