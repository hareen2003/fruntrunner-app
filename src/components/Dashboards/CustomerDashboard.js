import React from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import './Dashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Customer Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user.fullName}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <h2>My Orders</h2>
        <p>Customer dashboard features coming soon...</p>
      </div>
    </div>
  );
};

export default CustomerDashboard;
