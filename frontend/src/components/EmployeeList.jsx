import React from 'react';
import { Trash2, User } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import './EmployeeList.css';

const EmployeeList = ({ employees, loading, onDeleteEmployee }) => {
  if (loading && employees.length === 0) {
    return (
      <div className="employees-list">
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="employees-list">
        <div className="empty-state">
          <User className="empty-icon" />
          <p className="empty-title">No employees found</p>
          <p className="empty-subtitle">Add your first employee to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employees-list">
      {employees.map((employee) => (
        <div key={employee.id} className="employee-item">
          <div className="employee-info">
            <div className="employee-avatar">
              <span className="avatar-text">
                {employee.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="employee-details">
              <p className="employee-name">{employee.name}</p>
              {employee.email && (
                <p className="employee-email">{employee.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDeleteEmployee(employee.id)}
            disabled={loading}
            className="delete-button"
          >
            <Trash2 className="delete-icon" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EmployeeList;