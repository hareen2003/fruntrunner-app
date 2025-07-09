const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Submit quotation
router.post('/quotations', authMiddleware, async (req, res) => {
    try {
        const { item, quantity, price, deliveryTime } = req.body;
        const { userId } = req.user;
        
        const [result] = await db.execute(
            'INSERT INTO quotations (supplier_id, item, quantity, price, delivery_time) VALUES (?, ?, ?, ?, ?)',
            [userId, item, quantity, price, deliveryTime]
        );
        
        res.json({ 
            success: true, 
            message: 'Quotation submitted successfully', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Submit quotation error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit quotation' });
    }
});

// Get quotations by supplier
router.get('/quotations', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        
        const [quotations] = await db.execute(
            'SELECT * FROM quotations WHERE supplier_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        res.json({ success: true, quotations });
    } catch (error) {
        console.error('Fetch quotations error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch quotations' });
    }
});

// Get all suppliers (for manager dashboard)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [suppliers] = await db.execute(`
            SELECT id, full_name, email, company_name, mobile, created_at 
            FROM users 
            WHERE role = 'Supplier'
            ORDER BY full_name
        `);
        
        res.json({ success: true, suppliers });
    } catch (error) {
        console.error('Fetch suppliers error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch suppliers' });
    }
});

// Update quotation status (for managers)
router.put('/quotations/:quotationId/status', authMiddleware, async (req, res) => {
    try {
        const { quotationId } = req.params;
        const { status } = req.body;
        
        const [result] = await db.execute(
            'UPDATE quotations SET status = ? WHERE id = ?',
            [status, quotationId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Quotation not found' });
        }
        
        res.json({ success: true, message: 'Quotation status updated successfully' });
    } catch (error) {
        console.error('Update quotation error:', error);
        res.status(500).json({ success: false, error: 'Failed to update quotation' });
    }
});

module.exports = router;
// UPDATE - Update quotation
router.put('/quotations/:quotationId', authMiddleware, async (req, res) => {
    try {
        const { quotationId } = req.params;
        const { item, quantity, price, deliveryTime } = req.body;
        const { userId } = req.user;
        
        const [result] = await db.execute(
            'UPDATE quotations SET item = ?, quantity = ?, price = ?, delivery_time = ? WHERE id = ? AND supplier_id = ?',
            [item, quantity, price, deliveryTime, quotationId, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Quotation not found or unauthorized' });
        }
        
        res.json({ success: true, message: 'Quotation updated successfully' });
    } catch (error) {
        console.error('Update quotation error:', error);
        res.status(500).json({ success: false, error: 'Failed to update quotation' });
    }
});

// DELETE - Delete quotation
router.delete('/quotations/:quotationId', authMiddleware, async (req, res) => {
    try {
        const { quotationId } = req.params;
        const { userId } = req.user;
        
        const [result] = await db.execute(
            'DELETE FROM quotations WHERE id = ? AND supplier_id = ? AND status = "Pending"',
            [quotationId, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Quotation not found, unauthorized, or cannot delete approved/rejected quotations' 
            });
        }
        
        res.json({ success: true, message: 'Quotation deleted successfully' });
    } catch (error) {
        console.error('Delete quotation error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete quotation' });
    }
});

// Get quotation statistics
router.get('/quotations/stats', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
                AVG(price) as avg_price,
                SUM(price * quantity) as total_value
            FROM quotations 
            WHERE supplier_id = ?
        `, [userId]);
        
        res.json({ success: true, stats: stats[0] });
    } catch (error) {
        console.error('Fetch quotation stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

