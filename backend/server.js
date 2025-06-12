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
  user: 'root', //MySQL username
  password: '', //MySQL password
  database: 'meeting_attendence_app' //database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


db.query(createEmployeesTable, (err) => {
  if (err) {
    console.error('Error creating employees table:', err);
  } else {
    console.log('Employees table ready');
  }
});

// Routes

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});