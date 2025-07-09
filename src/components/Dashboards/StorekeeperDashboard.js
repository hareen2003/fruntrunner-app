import React from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import './Dashboard.css';

const StorekeeperDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Storekeeper Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user.fullName}</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="dashboard-content">
        <h2>Inventory Management</h2>
        <p>Storekeeper dashboard features coming soon...</p>
      </div>
    </div>
  );
};

export default StorekeeperDashboard;