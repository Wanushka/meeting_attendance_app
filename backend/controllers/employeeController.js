const Employee = require('../models/Employee');
const ResponseFormatter = require('../utils/responseFormatter');

class EmployeeController {
  static getAllEmployees(req, res) {
    Employee.getAll((err, results) => {
      if (err) {
        console.error('Error fetching employees:', err);
        return ResponseFormatter.error(res, 'Failed to fetch employees', 500);
      }
      ResponseFormatter.success(res, results);
    });
  }

  static createEmployee(req, res) {
    const { name, email, position } = req.body;
    
    if (!name) {
      return ResponseFormatter.error(res, 'Name is required', 400);
    }
    
    Employee.create({ name, email, position }, (err, result) => {
      if (err) {
        console.error('Error adding employee:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return ResponseFormatter.error(res, 'Employee with this email already exists', 400);
        }
        return ResponseFormatter.error(res, 'Failed to add employee', 500);
      }
      
      const newEmployee = {
        id: result.insertId,
        name,
        email: email || null,
        position: position || null,
        created_at: new Date()
      };
      
      ResponseFormatter.success(res, newEmployee, 201);
    });
  }

  static deleteEmployee(req, res) {
    const employeeId = req.params.id;
    
    Employee.delete(employeeId, (err, result) => {
      if (err) {
        console.error('Error deleting employee:', err);
        return ResponseFormatter.error(res, 'Failed to delete employee', 500);
      }
      
      if (result.affectedRows === 0) {
        return ResponseFormatter.error(res, 'Employee not found', 404);
      }
      
      ResponseFormatter.success(res, { message: 'Employee deleted successfully' });
    });
  }
}

module.exports = EmployeeController;