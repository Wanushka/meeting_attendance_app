// Employee API service
const API_BASE_URL = 'http://localhost:5000/api';

export const employeeService = {
  // Fetch all employees
  async getEmployees() {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    return await response.json();
  },

  // Add new employee
  async addEmployee(employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add employee');
    }

    return await response.json();
  },

  // Delete employee
  async deleteEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete employee');
    }

    return await response.json();
  }
};