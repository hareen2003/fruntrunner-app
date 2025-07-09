import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import CEODashboard from './components/Dashboards/CEODashboard';
import GeneralManagerDashboard from './components/Dashboards/GeneralManagerDashboard';
import SupplierDashboard from './components/Dashboards/SupplierDashboard';
import StorekeeperDashboard from './components/Dashboards/StorekeeperDashboard';
import CustomerDashboard from './components/Dashboards/CustomerDashboard';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/unauthorized" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/ceo-dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['CEO']}>
                  <CEODashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/manager-dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['General Manager']}>
                  <GeneralManagerDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/supplier-dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['Supplier']}>
                  <SupplierDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/storekeeper-dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['Storekeeper']}>
                  <StorekeeperDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/customer-dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['Customer']}>
                  <CustomerDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
