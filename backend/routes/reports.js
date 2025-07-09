const express = require('express');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// CREATE - Generate new report
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { type, frequency, dateFrom, dateTo, filters } = req.body;
        const { userId } = req.user;
        
        // Generate unique report ID
        const reportId = `${type.substring(0, 3).toUpperCase()}${Date.now()}`;
        
        // Generate report data based on type
        let reportData = {};
        
        switch (type) {
            case 'Tender Compliance':
                reportData = await generateTenderComplianceReport(dateFrom, dateTo, filters);
                break;
            case 'Risk Mitigation':
                reportData = await generateRiskMitigationReport(dateFrom, dateTo, filters);
                break;
            case 'Financial Summary':
                reportData = await generateFinancialSummaryReport(dateFrom, dateTo, filters);
                break;
            case 'Supplier Performance':
                reportData = await generateSupplierPerformanceReport(dateFrom, dateTo, filters);
                break;
            case 'Order Analytics':
                reportData = await generateOrderAnalyticsReport(dateFrom, dateTo, filters);
                break;
        }
        
        // Save report to database
        const [result] = await db.execute(
            'INSERT INTO reports (report_id, type, frequency, generated_by, status, report_data) VALUES (?, ?, ?, ?, ?, ?)',
            [reportId, type, frequency, userId, 'Generated', JSON.stringify(reportData)]
        );
        
        res.json({ 
            success: true, 
            message: 'Report generated successfully',
            reportId: reportId,
            id: result.insertId,
            data: reportData
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate report' });
    }
});

// READ - Get all reports with pagination and filters
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { type, frequency, page = 1, limit = 10, dateFrom, dateTo } = req.query;
        
        let query = `
            SELECT r.*, u.full_name as generated_by_name
            FROM reports r
            LEFT JOIN users u ON r.generated_by = u.id
        `;
        
        const queryParams = [];
        const conditions = [];
        
        if (type) {
            conditions.push('r.type = ?');
            queryParams.push(type);
        }
        
        if (frequency) {
            conditions.push('r.frequency = ?');
            queryParams.push(frequency);
        }
        
        if (dateFrom && dateTo) {
            conditions.push('r.created_at BETWEEN ? AND ?');
            queryParams.push(dateFrom, dateTo);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY r.created_at DESC';
        
        // Add pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const [reports] = await db.execute(query, queryParams);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM reports r';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        
        const [countResult] = await db.execute(countQuery, queryParams.slice(0, -2));
        
        res.json({ 
            success: true, 
            reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Fetch reports error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch reports' });
    }
});

// READ - Get single report with data
router.get('/:reportId', authMiddleware, async (req, res) => {
    try {
        const { reportId } = req.params;
        
        const [reports] = await db.execute(`
            SELECT r.*, u.full_name as generated_by_name
            FROM reports r
            LEFT JOIN users u ON r.generated_by = u.id
            WHERE r.report_id = ?
        `, [reportId]);
        
        if (reports.length === 0) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }
        
        const report = reports[0];
        if (report.report_data) {
            report.data = JSON.parse(report.report_data);
        }
        
        res.json({ success: true, report });
    } catch (error) {
        console.error('Fetch report error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch report' });
    }
});

// UPDATE - Update report status
router.put('/:reportId/status', authMiddleware, async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;
        
        const [result] = await db.execute(
            'UPDATE reports SET status = ? WHERE report_id = ?',
            [status, reportId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }
        
        res.json({ success: true, message: 'Report status updated successfully' });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({ success: false, error: 'Failed to update report' });
    }
});

// DELETE - Delete report
router.delete('/:reportId', authMiddleware, async (req, res) => {
    try {
        const { reportId } = req.params;
        
        const [result] = await db.execute(
            'DELETE FROM reports WHERE report_id = ?',
            [reportId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }
        
        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete report' });
    }
});

// ANALYTICS - Dashboard analytics
router.get('/analytics/dashboard', authMiddleware, async (req, res) => {
    try {
        const { period = '30' } = req.query; // days
        
        const analytics = await Promise.all([
            // Total orders by status
            db.execute(`
                SELECT status, COUNT(*) as count 
                FROM orders 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY status
            `, [period]),
            
            // Revenue by month
            db.execute(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    SUM(amount) as revenue,
                    COUNT(*) as order_count
                FROM orders 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                AND status != 'Rejected'
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month
            `, [period]),
            
            // Top suppliers
            db.execute(`
                SELECT 
                    u.full_name,
                    u.company_name,
                    COUNT(o.id) as order_count,
                    SUM(o.amount) as total_amount
                FROM users u
                JOIN orders o ON u.id = o.supplier_id
                WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY u.id
                ORDER BY total_amount DESC
                LIMIT 5
            `, [period]),
            
            // Quotation trends
            db.execute(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                    COUNT(*) as quotation_count,
                    AVG(price) as avg_price
                FROM quotations 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
                ORDER BY date
            `, [period])
        ]);
        
        res.json({
            success: true,
            analytics: {
                ordersByStatus: analytics[0][0],
                revenueByMonth: analytics[1][0],
                topSuppliers: analytics[2][0],
                quotationTrends: analytics[3][0]
            }
        });
    } catch (error) {
        console.error('Fetch analytics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
});

// Report generation helper functions
async function generateTenderComplianceReport(dateFrom, dateTo, filters) {
    const [orders] = await db.execute(`
        SELECT o.*, u.full_name as supplier_name, u.company_name
        FROM orders o
        JOIN users u ON o.supplier_id = u.id
        WHERE o.created_at BETWEEN ? AND ?
        ORDER BY o.created_at DESC
    `, [dateFrom, dateTo]);
    
    const compliance = {
        totalOrders: orders.length,
        compliantOrders: orders.filter(o => o.status === 'Delivered').length,
        pendingOrders: orders.filter(o => o.status === 'Pending').length,
        complianceRate: 0
    };
    
    compliance.complianceRate = ((compliance.compliantOrders / compliance.totalOrders) * 100).toFixed(2);
    
    return {
        summary: compliance,
        orders: orders,
        generatedAt: new Date(),
        period: { from: dateFrom, to: dateTo }
    };
}

async function generateRiskMitigationReport(dateFrom, dateTo, filters) {
    const [orders] = await db.execute(`
        SELECT o.*, u.full_name as supplier_name
        FROM orders o
        JOIN users u ON o.supplier_id = u.id
        WHERE o.created_at BETWEEN ? AND ?
    `, [dateFrom, dateTo]);
    
    const risks = {
        delayedOrders: orders.filter(o => o.status === 'Pending' && 
            new Date() - new Date(o.created_at) > 7 * 24 * 60 * 60 * 1000).length,
        highValueOrders: orders.filter(o => o.amount > 5000).length,
        supplierRisks: []
    };
    
    return {
        risks,
        recommendations: [
            'Monitor delayed orders closely',
            'Diversify supplier base',
            'Implement automated alerts'
        ],
        generatedAt: new Date(),
        period: { from: dateFrom, to: dateTo }
    };
}

async function generateFinancialSummaryReport(dateFrom, dateTo, filters) {
    const [financialData] = await db.execute(`
        SELECT 
            SUM(amount) as total_revenue,
            AVG(amount) as avg_order_value,
            COUNT(*) as total_orders,
            SUM(CASE WHEN status = 'Delivered' THEN amount ELSE 0 END) as delivered_revenue
        FROM orders
        WHERE created_at BETWEEN ? AND ?
    `, [dateFrom, dateTo]);
    
    return {
        summary: financialData[0],
        generatedAt: new Date(),
        period: { from: dateFrom, to: dateTo }
    };
}

async function generateSupplierPerformanceReport(dateFrom, dateTo, filters) {
    const [supplierData] = await db.execute(`
        SELECT 
            u.full_name,
            u.company_name,
            COUNT(o.id) as total_orders,
            SUM(o.amount) as total_revenue,
            AVG(o.amount) as avg_order_value,
            SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders
        FROM users u
        LEFT JOIN orders o ON u.id = o.supplier_id AND o.created_at BETWEEN ? AND ?
        WHERE u.role = 'Supplier'
        GROUP BY u.id
        ORDER BY total_revenue DESC
    `, [dateFrom, dateTo]);
    
    return {
        suppliers: supplierData,
        generatedAt: new Date(),
        period: { from: dateFrom, to: dateTo }
    };
}

async function generateOrderAnalyticsReport(dateFrom, dateTo, filters) {
    const [orderAnalytics] = await db.execute(`
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            status,
            COUNT(*) as count,
            SUM(amount) as total_amount
        FROM orders
        WHERE created_at BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), status
        ORDER BY month, status
    `, [dateFrom, dateTo]);
    
    return {
        analytics: orderAnalytics,
        generatedAt: new Date(),
        period: { from: dateFrom, to: dateTo }
    };
}

module.exports = router;
