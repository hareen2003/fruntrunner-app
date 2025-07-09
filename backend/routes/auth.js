const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, mobile, password, companyName, username } = req.body;
        
        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username || email, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, full_name, role, company_name, mobile) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username || email, email, hashedPassword, fullName, 'Customer', companyName, mobile]
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: result.insertId, role: 'Customer' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: result.insertId,
                username: username || email,
                fullName,
                email,
                role: 'Customer'
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const user = users[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const [users] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // In a real app, you would send an email here
        res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, error: 'Failed to process request' });
    }
});

module.exports = router;
