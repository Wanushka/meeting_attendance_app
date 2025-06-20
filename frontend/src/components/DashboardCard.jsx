import React, { useState, useEffect } from 'react';
import './DashboardCard.css';
import { format } from 'date-fns';

const DashboardCard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    purpose: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    members: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Fetch employees for the meeting creation form
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees');
      }
    };

    fetchEmployees();
  }, []);

  // Fetch meetings for the overview tab
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/meetings');
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }
        const data = await response.json();
        setMeetings(data);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'overview') {
      fetchMeetings();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    
    if (!newMeeting.title || !newMeeting.purpose || !newMeeting.date || !newMeeting.time) {
      setError('Please fill out all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMeeting,
          members: [] // Send empty members array since we're adding them separately now
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      // Reset form
      setNewMeeting({
        title: '',
        purpose: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        members: []
      });
      
      // Show success message or update meetings list
      alert('Meeting created successfully');
      
      // Switch to overview tab to see the new meeting
      setActiveTab('overview');
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Failed to create meeting');
    }
  };

  const sendQRCode = async (meetingId, employeeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/meetings/${meetingId}/send-qr/${employeeId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to send QR code');
      }
      
      alert('QR code sent successfully');
    } catch (err) {
      console.error('Error sending QR code:', err);
      setError('Failed to send QR code');
    }
  };
  
  const openAddMembersModal = (meeting) => {
    setSelectedMeeting(meeting);
    
    // Initialize selected members with existing meeting members
    if (meeting.members && meeting.members.length > 0) {
      const existingMemberIds = meeting.members
        .filter(member => member.id) // Filter out any null members
        .map(member => member.id);
      setSelectedMembers(existingMemberIds);
    } else {
      setSelectedMembers([]);
    }
    
    setShowMemberModal(true);
  };
  
  const handleMemberToggle = (employeeId) => {
    setSelectedMembers(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };
  
  const addMembersToMeeting = async () => {
    if (!selectedMeeting) return;
    
    try {
      setError(null); // Clear any previous errors
      
      console.log(`Adding members to meeting ${selectedMeeting.id}:`, selectedMembers);
      
      const response = await fetch(`http://localhost:5000/api/meetings/${selectedMeeting.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberIds: selectedMembers
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add members to meeting');
      }
      
      // Close the modal
      setShowMemberModal(false);
      
      // Show success message
      alert(data.message || `Successfully added members to meeting: ${selectedMeeting.title}`);
      
      // Refresh meetings list
      if (activeTab === 'overview') {
        const meetingsResponse = await fetch('http://localhost:5000/api/meetings');
        if (meetingsResponse.ok) {
          const meetingsData = await meetingsResponse.json();
          setMeetings(meetingsData);
        }
      }
    } catch (err) {
      console.error('Error adding members to meeting:', err);
      setError(err.message || 'Failed to add members to meeting');
      alert(`Error: ${err.message || 'Failed to add members to meeting'}`);
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content overview-content">
            <h3>All Meetings</h3>
            {loading ? (
              <p>Loading meetings...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : meetings.length === 0 ? (
              <p>No meetings found. Create a meeting in the Meeting tab.</p>
            ) : (
              <div className="meetings-list">
                {meetings.map(meeting => (
                  <div key={meeting.id} className="meeting-card">
                    <h4>{meeting.title}</h4>
                    <p><strong>Purpose:</strong> {meeting.purpose}</p>
                    <p><strong>Date:</strong> {format(new Date(meeting.date), 'MMM d, yyyy')}</p>
                    <p><strong>Time:</strong> {meeting.time.substring(0, 5)}</p>
                    <div className="meeting-members">
                      <div className="members-header">
                        <h5>Members:</h5>
                        <button 
                          className="add-members-btn"
                          onClick={() => openAddMembersModal(meeting)}
                        >
                          Add Members
                        </button>
                      </div>
                      {meeting.members && meeting.members.length > 0 ? (
                        <div className="members-list">
                          <table className="members-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {meeting.members.map(member => (
                                member && member.id ? (
                                  <tr key={member.id}>
                                    <td>{member.name}</td>
                                    <td>
                                      <span className={`status-badge ${member.attendance_status}`}>
                                        {member.attendance_status}
                                      </span>
                                    </td>
                                    <td>
                                      <button 
                                        className="send-qr-btn"
                                        onClick={() => sendQRCode(meeting.id, member.id)}
                                        disabled={member.qr_sent}
                                      >
                                        {member.qr_sent ? 'QR Sent' : 'Send QR'}
                                      </button>
                                    </td>
                                  </tr>
                                ) : null
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p>No members added to this meeting</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'meeting':
        return (
          <div className="tab-content meeting-content">
            <h3>Create New Meeting</h3>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleCreateMeeting} className="meeting-form">
              <div className="form-group">
                <label htmlFor="title">Meeting Title*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newMeeting.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="purpose">Purpose*</label>
                <textarea
                  id="purpose"
                  name="purpose"
                  value={newMeeting.purpose}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date*</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newMeeting.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="time">Time*</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={newMeeting.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="create-meeting-btn">
                Create Meeting
              </button>
            </form>
          </div>
        );
      
      case 'attendance':
        return (
          <div className="tab-content attendance-content">
            <h3>Attendance</h3>
            <p className="dashboard-placeholder">Attendance tracking feature will be implemented later</p>
          </div>
        );
        
      default:
        return <p className="dashboard-placeholder">Select a tab to view content</p>;
    }
  };

  return (
    <div className="dashboard-card">
      <h2 className="dashboard-title">Meeting Dashboard</h2>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'meeting' ? 'active' : ''}`}
          onClick={() => setActiveTab('meeting')}
        >
          Meeting
        </button>
        <button 
          className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
      </div>
      
      <div className="dashboard-content">
        {renderTabContent()}
      </div>
      
      {/* Add Members Modal */}
      {showMemberModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Add Members to {selectedMeeting?.title}</h3>
            <div className="members-selection">
              {employees.length > 0 ? (
                employees.map(employee => (
                  <div key={employee.id} className="member-checkbox">
                    <input
                      type="checkbox"
                      id={`modal-employee-${employee.id}`}
                      checked={selectedMembers.includes(employee.id)}
                      onChange={() => handleMemberToggle(employee.id)}
                    />
                    <label htmlFor={`modal-employee-${employee.id}`}>
                      {employee.name} ({employee.position || 'No position'})
                    </label>
                  </div>
                ))
              ) : (
                <p>No employees found. Add employees first.</p>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowMemberModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={addMembersToMeeting} className="confirm-btn">
                Add Members
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;