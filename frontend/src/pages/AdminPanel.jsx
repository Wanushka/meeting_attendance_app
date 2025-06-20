import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X, User } from 'lucide-react';
import EmployeeList from '../components/EmployeeList';
import EmployeeModal from '../components/EmployeeModal';
import DashboardCard from '../components/DashboardCard';
import TitleBar from '../components/TitleBar';
import FooterBar from '../components/FooterBar';
import { employeeService } from '../services/employeeService';
import './AdminPanel.css';

const AdminPanel = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: ''
  });

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to fetch employees. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Add new employee
  const addEmployee = async () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    try {
      setLoading(true);
      const newEmployee = await employeeService.addEmployee(formData);
      setEmployees([newEmployee, ...employees]);
      setFormData({ name: '', email: '', position: '' });
      setShowAddForm(false);
      alert('Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      setLoading(true);
      await employeeService.deleteEmployee(id);
      setEmployees(employees.filter(emp => emp.id !== id));
      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowAddForm(false);
    setFormData({ name: '', email: '', position: '' });
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <TitleBar title="Admin Dashboard" />

        <div className="dashboard-grid">
          <DashboardCard 
            employees={employees}
            loading={loading}
            onEmployeeUpdate={fetchEmployees}
          />

          <div className="employees-card">
            <div className="employees-header">
              <h2 className="employees-title">Employees</h2>
              <span className="employees-count">({employees.length} total)</span>
            </div>

            <EmployeeList 
              employees={employees}
              loading={loading}
              onDeleteEmployee={deleteEmployee}
            />

            <button
              onClick={() => setShowAddForm(true)}
              className="add-employee-button"
            >
              <Plus className="add-icon" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        <FooterBar />

        {showAddForm && (
          <EmployeeModal
            formData={formData}
            loading={loading}
            onInputChange={handleInputChange}
            onSubmit={addEmployee}
            onClose={handleModalClose}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;