const express = require('express');
const EmployeeController = require('../controllers/employeeController');

const router = express.Router();

// GET /api/employees - Get all employees
router.get('/', EmployeeController.getAllEmployees);

// POST /api/employees - Create new employee
router.post('/', EmployeeController.createEmployee);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', EmployeeController.deleteEmployee);

module.exports = router;