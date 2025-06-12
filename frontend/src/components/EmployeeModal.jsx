import React from 'react';
import { X } from 'lucide-react';
import './EmployeeModal.css';

const EmployeeModal = ({ formData, loading, onInputChange, onSubmit, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Add New Employee</h3>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X className="close-icon" />
          </button>
        </div>

        <div className="form-container">
          <div className="form-group">
            <label className="form-label">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              required
              className="form-input"
              placeholder="Enter employee name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              className="form-input"
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={onInputChange}
              className="form-input"
              placeholder="Enter job position"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;