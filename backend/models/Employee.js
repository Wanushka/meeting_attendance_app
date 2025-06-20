const db = require('../config/database');

class Employee {
  static getAll(callback) {
    const query = 'SELECT * FROM employees ORDER BY created_at DESC';
    db.query(query, callback);
  }

  static create(employeeData, callback) {
    const { name, email, position } = employeeData;
    const query = 'INSERT INTO employees (name, email, position) VALUES (?, ?, ?)';
    db.query(query, [name, email || null, position || null], callback);
  }

  static delete(id, callback) {
    const query = 'DELETE FROM employees WHERE id = ?';
    db.query(query, [id], callback);
  }

  static findById(id, callback) {
    const query = 'SELECT * FROM employees WHERE id = ?';
    db.query(query, [id], callback);
  }
}

module.exports = Employee;