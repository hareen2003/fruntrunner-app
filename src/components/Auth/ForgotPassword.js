import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
const ForgotPassword = () => {
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');
const handleSubmit = (e) => {
e.preventDefault();
setMessage('Password reset link sent to your email!');
};
return (
<div className="auth-container">
<div className="auth-card">
<div className="auth-header">
<h1>Fruntrunner International</h1>
<h3>Forgot Password</h3>
</div>
<form onSubmit={handleSubmit} className="auth-form">
{message && <div className="success-message">{message}</div>}
<div className="form-group">
<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
</div>
<button type="submit" className="auth-button">
Send Reset Link
</button>
</form>
<div className="auth-links">
<Link to="/login">Back to Login</Link>
</div>
</div>
</div>
);
};
export default ForgotPassword;