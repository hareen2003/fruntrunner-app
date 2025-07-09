import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);
    
    if (result.success) {
      // Redirect based on role
      switch (result.user.role) {
        case 'CEO':
          navigate('/ceo-dashboard');
          break;
        case 'General Manager':
          navigate('/manager-dashboard');
          break;
        case 'Supplier':
          navigate('/supplier-dashboard');
          break;
        case 'Storekeeper':
          navigate('/storekeeper-dashboard');
          break;
        case 'Customer':
          navigate('/customer-dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Fruntrunner International</h1>
          <h2>Welcome back! Glad to see you, Again!</h2>
          <h3>Log In</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/signup">Don't have an account? Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
