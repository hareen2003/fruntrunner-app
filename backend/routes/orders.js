const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// CREATE - Add new order
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { supplier_id, customer_id, items, amount } = req.body;
        
        // Generate unique order ID
        const order_id = 'S' + Date.now().toString().slice(-6);
        
        const [result] = await db.execute(
            'INSERT INTO orders (order_id, supplier_id, customer_id, items, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
            [order_id, supplier_id, customer_id, items, amount, 'Pending']
        );
        
        res.json({ 
            success: true, 
            message: 'Order created successfully',
            orderId: order_id,
            id: result.insertId
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

// READ - Get all orders (for managers/CEO)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, supplier_id, customer_id, page = 1, limit = 10 } = req.query;
        
        let query = `
            SELECT o.*, 
                   us.full_name as supplier_name,
                   uc.full_name as customer_name,
                   us.company_name as supplier_company
            FROM orders o 
            LEFT JOIN users us ON o.supplier_id = us.id 
            LEFT JOIN users uc ON o.customer_id = uc.id 
        `;
        
        const queryParams = [];
        const conditions = [];
        
        if (status) {
            conditions.push('o.status = ?');
            queryParams.push(status);
        }
        
        if (supplier_id) {
            conditions.push('o.supplier_id = ?');
            queryParams.push(supplier_id);
        }
        
        if (customer_id) {
            conditions.push('o.customer_id = ?');
            queryParams.push(customer_id);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY o.created_at DESC';
        
        // Add pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const [orders] = await db.execute(query, queryParams);
        
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM orders o';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        
        const [countResult] = await db.execute(countQuery, queryParams.slice(0, -2));
        const total = countResult[0].total;
        
        res.json({ 
            success: true, 
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Fetch orders error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

// READ - Get single order by ID
router.get('/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const [orders] = await db.execute(`
            SELECT o.*, 
                   us.full_name as supplier_name,
                   uc.full_name as customer_name,
                   us.company_name as supplier_company,
                   us.email as supplier_email,
                   uc.email as customer_email
            FROM orders o 
            LEFT JOIN users us ON o.supplier_id = us.id 
            LEFT JOIN users uc ON o.customer_id = uc.id 
            WHERE o.order_id = ?
        `, [orderId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        // Get shipping documents for this order
        const [documents] = await db.execute(
            'SELECT * FROM shipping_documents WHERE order_id = ?',
            [orders[0].id]
        );
        
        res.json({ 
            success: true, 
            order: { ...orders[0], documents }
        });
    } catch (error) {
        console.error('Fetch order error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
});

// UPDATE - Update order status
router.put('/:orderId/status', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes } = req.body;
        
        const [result] = await db.execute(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
            [status, orderId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        // Log status change (optional - you can create a separate audit table)
        if (notes) {
            await db.execute(
                'INSERT INTO order_logs (order_id, action, notes, created_by) VALUES (?, ?, ?, ?)',
                [orderId, `Status changed to ${status}`, notes, req.user.userId]
            );
        }
        
        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ success: false, error: 'Failed to update order' });
    }
});

// UPDATE - Update entire order
router.put('/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { supplier_id, customer_id, items, amount, status } = req.body;
        
        const [result] = await db.execute(
            'UPDATE orders SET supplier_id = ?, customer_id = ?, items = ?, amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
            [supplier_id, customer_id, items, amount, status, orderId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        res.json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ success: false, error: 'Failed to update order' });
    }
});

// DELETE - Delete order
router.delete('/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // First, delete related shipping documents
        await db.execute(
            'DELETE FROM shipping_documents WHERE order_id = (SELECT id FROM orders WHERE order_id = ?)',
            [orderId]
        );
        
        // Then delete the order
        const [result] = await db.execute(
            'DELETE FROM orders WHERE order_id = ?',
            [orderId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete order' });
    }
});

// BULK UPDATE - Update multiple orders
router.put('/bulk/update', authMiddleware, async (req, res) => {
    try {
        const { orderIds, status } = req.body;
        
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid order IDs' });
        }
        
        const placeholders = orderIds.map(() => '?').join(',');
        const [result] = await db.execute(
            `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id IN (${placeholders})`,
            [status, ...orderIds]
        );
        
        res.json({ 
            success: true, 
            message: `${result.affectedRows} orders updated successfully` 
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({ success: false, error: 'Failed to update orders' });
    }
});

module.exports = router;
