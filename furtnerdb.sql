 - Create database
CREATE DATABASE fruntrunner_db;
USE fruntrunner_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('CEO', 'General Manager', 'Supplier', 'Storekeeper', 'Customer') NOT NULL,
    company_name VARCHAR(100),
    mobile VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    supplier_id INT,
    customer_id INT,
    status ENUM('Pending', 'Approved', 'Rejected', 'Shipped', 'Delivered') DEFAULT 'Pending',
    amount DECIMAL(10,2),
    items TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Quotations table
CREATE TABLE quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    item VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    delivery_time INT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES users(id)
);

-- Reports table
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(20) UNIQUE NOT NULL,
    type ENUM('Tender Compliance', 'Risk Mitigation', 'Financial Summary') NOT NULL,
    frequency ENUM('Monthly', 'Yearly') NOT NULL,
    generated_by INT,
    file_path VARCHAR(255),
    status ENUM('Generated', 'Draft') DEFAULT 'Generated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- Shipping documents table
CREATE TABLE shipping_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    document_name VARCHAR(255),
    file_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert Users (password is 'password' hashed with bcrypt)
INSERT INTO users (username, email, password, full_name, role, company_name, mobile) VALUES
('ceo', 'ceo@fruntrunner.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'CEO', 'Fruntrunner International', '+1-555-0101'),
('manager', 'manager@fruntrunner.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', 'General Manager', 'Fruntrunner International', '+1-555-0102'),
('supplier1', 'supplier1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Johnson', 'Supplier', 'Johnson Supplies Ltd', '+1-555-0201'),
('supplier2', 'supplier2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria Garcia', 'Supplier', 'Garcia Industrial Co', '+1-555-0202'),
('supplier3', 'supplier3@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmed Hassan', 'Supplier', 'Hassan Trading Corp', '+1-555-0203'),
('storekeeper', 'storekeeper@fruntrunner.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Brown', 'Storekeeper', 'Fruntrunner International', '+1-555-0103'),
('customer1', 'customer1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlie Wilson', 'Customer', 'Wilson Construction', '+1-555-0301'),
('customer2', 'customer2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Diana Lee', 'Customer', 'Lee Manufacturing', '+1-555-0302'),
('customer3', 'customer3@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert Taylor', 'Customer', 'Taylor Enterprises', '+1-555-0303'),
('customer4', 'customer4@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Davis', 'Customer', 'Davis Solutions Inc', '+1-555-0304');

-- Insert Quotations
INSERT INTO quotations (supplier_id, item, quantity, price, delivery_time, status, created_at) VALUES
(3, 'Steel Pipes (Grade A)', 500, 125.50, 15, 'Pending', '2025-06-15 09:30:00'),
(3, 'Industrial Valves', 200, 89.75, 10, 'Approved', '2025-06-18 14:20:00'),
(4, 'Electrical Components', 1000, 45.20, 7, 'Pending', '2025-06-20 11:15:00'),
(4, 'Control Panels', 25, 850.00, 21, 'Approved', '2025-06-22 16:45:00'),
(5, 'Raw Materials Bundle', 300, 220.30, 12, 'Pending', '2025-06-25 08:10:00'),
(5, 'Safety Equipment', 150, 95.80, 5, 'Rejected', '2025-06-26 13:30:00'),
(3, 'Copper Wiring', 800, 78.40, 8, 'Approved', '2025-06-27 10:25:00'),
(4, 'Machinery Parts', 75, 420.60, 18, 'Pending', '2025-06-28 15:00:00');

-- Insert Orders
INSERT INTO orders (order_id, supplier_id, customer_id, status, amount, items, created_at, updated_at) VALUES
('S0037021', 3, 7, 'Pending', 3552.00, 'Steel Pipes (Grade A) - 500 units, Industrial Fittings - 100 units', '2025-04-28 10:15:00', '2025-04-28 10:15:00'),
('S0037022', 4, 8, 'Approved', 5403.00, 'Electrical Components - 1000 units, Control Panels - 25 units', '2025-05-12 14:30:00', '2025-05-15 09:20:00'),
('S0037023', 5, 9, 'Approved', 2457.00, 'Raw Materials Bundle - 300 units', '2025-06-03 11:45:00', '2025-06-05 16:10:00'),
('S0037024', 3, 10, 'Shipped', 345.00, 'Copper Wiring - 800 units', '2025-06-24 09:20:00', '2025-06-26 14:30:00'),
('S0037025', 4, 7, 'Pending', 1154.00, 'Safety Equipment - 150 units', '2025-07-09 13:15:00', '2025-07-09 13:15:00'),
('S0030134', 5, 8, 'Delivered', 4875.00, 'Machinery Parts - 75 units, Industrial Tools - 200 units', '2025-08-11 08:45:00', '2025-08-20 17:30:00'),
('S0037026', 3, 9, 'Approved', 2890.50, 'Steel Beams - 150 units, Welding Materials - 500 units', '2025-06-26 12:00:00', '2025-06-27 10:15:00'),
('S0037027', 4, 10, 'Pending', 1670.25, 'Electronic Sensors - 300 units', '2025-06-27 15:30:00', '2025-06-27 15:30:00'),
('S0037028', 5, 7, 'Shipped', 3210.80, 'Industrial Chemicals - 100 liters, Protective Gear - 50 sets', '2025-06-28 11:20:00', '2025-06-28 14:45:00');

-- Insert Reports
INSERT INTO reports (report_id, type, frequency, generated_by, file_path, status, created_at) VALUES
('TCR001', 'Tender Compliance', 'Monthly', 2, '/reports/tender_compliance_june_2025.pdf', 'Generated', '2025-06-27 09:00:00'),
('RMR001', 'Risk Mitigation', 'Monthly', 1, '/reports/risk_mitigation_june_2025.pdf', 'Generated', '2025-06-27 10:30:00'),
('TCR002', 'Tender Compliance', 'Yearly', 2, '/reports/tender_compliance_2024.pdf', 'Generated', '2025-06-01 14:15:00'),
('FSR001', 'Financial Summary', 'Monthly', 1, '/reports/financial_summary_june_2025.pdf', 'Generated', '2025-06-28 08:45:00'),
('RMR002', 'Risk Mitigation', 'Yearly', 1, '/reports/risk_mitigation_2024.pdf', 'Generated', '2025-06-15 16:20:00'),
('TCR003', 'Tender Compliance', 'Monthly', 2, '/reports/tender_compliance_may_2025.pdf', 'Generated', '2025-05-31 11:30:00'),
('FSR002', 'Financial Summary', 'Yearly', 1, '/reports/financial_summary_2024.pdf', 'Generated', '2025-06-10 13:45:00'),
('RMR003', 'Risk Mitigation', 'Monthly', 2, '/reports/risk_mitigation_july_2025.pdf', 'Draft', '2025-06-28 17:00:00');

-- Insert Shipping Documents
INSERT INTO shipping_documents (order_id, document_name, file_path, uploaded_at) VALUES
(2, 'Bill of Lading - S0037022.pdf', '/uploads/shipping/bill_of_lading_S0037022.pdf', '2025-05-16 10:20:00'),
(2, 'Packing List - S0037022.pdf', '/uploads/shipping/packing_list_S0037022.pdf', '2025-05-16 10:25:00'),
(3, 'Invoice - S0037023.pdf', '/uploads/shipping/invoice_S0037023.pdf', '2025-06-06 14:15:00'),
(3, 'Delivery Receipt - S0037023.pdf', '/uploads/shipping/delivery_receipt_S0037023.pdf', '2025-06-06 14:18:00'),
(4, 'Shipping Manifest - S0037024.pdf', '/uploads/shipping/shipping_manifest_S0037024.pdf', '2025-06-26 15:30:00'),
(4, 'Quality Certificate - S0037024.pdf', '/uploads/shipping/quality_cert_S0037024.pdf', '2025-06-26 15:35:00'),
(6, 'Final Invoice - S0030134.pdf', '/uploads/shipping/final_invoice_S0030134.pdf', '2025-08-21 09:10:00'),
(6, 'Completion Certificate - S0030134.pdf', '/uploads/shipping/completion_cert_S0030134.pdf', '2025-08-21 09:15:00'),
(7, 'Transport Document - S0037026.pdf', '/uploads/shipping/transport_doc_S0037026.pdf', '2025-06-27 11:45:00'),
(9, 'Hazmat Certificate - S0037028.pdf', '/uploads/shipping/hazmat_cert_S0037028.pdf', '2025-06-28 15:20:00');

-- =============================================
-- CREATE ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================

-- Index for faster user role queries
CREATE INDEX idx_users_role ON users(role);

-- Index for order status queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_supplier ON orders(supplier_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);

-- Index for quotation status queries
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_supplier ON quotations(supplier_id);

-- Index for report type and frequency queries
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_frequency ON reports(frequency);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify the data insertion
SELECT 'Users Count' as Table_Name, COUNT(*) as Record_Count FROM users
UNION ALL
SELECT 'Orders Count', COUNT(*) FROM orders
UNION ALL
SELECT 'Quotations Count', COUNT(*) FROM quotations
UNION ALL
SELECT 'Reports Count', COUNT(*) FROM reports
UNION ALL
SELECT 'Shipping Documents Count', COUNT(*) FROM shipping_documents;

-- Show user distribution by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Show order status distribution
SELECT status, COUNT(*) as count FROM orders GROUP BY status;

-- Show quotation status distribution
SELECT status, COUNT(*) as count FROM quotations GROUP BY status;

-- Add report_data column to store generated report data
ALTER TABLE reports ADD COLUMN report_data LONGTEXT AFTER file_path;

-- Create order_logs table for audit trail
CREATE TABLE order_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20),
    action VARCHAR(255),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Add indexes for better performance
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_quotations_created_at ON quotations(created_at);