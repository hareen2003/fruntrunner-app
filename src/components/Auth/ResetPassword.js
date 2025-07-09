import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
const ResetPassword = () => {
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [message, setMessage] = useState('');
const handleSubmit = (e) => {
e.preventDefault();
if (password !== confirmPassword) {
setMessage('Passwords do not match');
return;
}
setMessage('Password reset successfully!');
};
return (
<div className="auth-container">
<div className="auth-card">
<div className="auth-header">
<h1>Fruntrunner International</h1>
<h3>Reset Password</h3>
</div>
<form onSubmit={handleSubmit} className="auth-form">
{message && <div className="success-message">{message}</div>}
<div className="form-group">
<input
type="password"
placeholder="New Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
</div>
<div className="form-group">
<input
type="password"
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
required
/>
</div>
File: src/components/Auth/ResetPassword.js
Right-click on Auth folder → "New File"
Name it: ResetPassword.js
Copy and paste this code:
<button type="submit" className="auth-button">
Reset Password
</button>
</form>
<div className="auth-links">
<Link to="/login">Back to Login</Link>
</div>
</div>
</div>
);
};
export default ResetPassword;