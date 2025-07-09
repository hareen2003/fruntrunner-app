import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import jsPDF from 'jspdf';
import './Dashboard.css';

const GeneralManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('orders');

  // Report generator state
  const [reportType, setReportType] = useState('Supplier Performance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [generatedReport, setGeneratedReport] = useState(null);

  const pendingOrders = [
    { id: 'S0037021', supplier: 'Supplier C01', date: '12.12.2025', status: 'Pending', action: 'Review' },
    { id: 'S0037022', supplier: 'Supplier C02', date: '14.12.2025', status: 'Pending', action: 'Approve' },
    { id: 'S0037023', supplier: 'Supplier C03', date: '15.12.2025', status: 'Pending', action: 'Approve' },
    { id: 'S0037024', supplier: 'Supplier C04', date: '21.12.2025', status: 'Pending', action: 'Review' },
    { id: 'S0037025', supplier: 'Supplier C05', date: '23.12.2025', status: 'Pending', action: 'Review' },
  ];

  const suppliers = [
    { name: 'SLCO S1', category: 'A', reliability: 90, status: 'Confidential' },
    { name: 'SLCO S1', category: 'D', reliability: 80, status: 'Confidential' },
    { name: 'SLCO S1', category: 'E', reliability: 90, status: 'Blue Default' },
    { name: 'SLCO S1', category: 'C', reliability: 72, status: 'Blue Default' },
    { name: 'SLCO S1', category: 'B', reliability: 89, status: 'Confidential' },
  ];

  const handleOrderAction = (orderId, action) => {
    console.log(`${action} order ${orderId}`);
    // Implement order action logic
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    // Simulate report data
    const report = {
      type: reportType,
      startDate,
      endDate,
      category,
      generatedAt: new Date().toLocaleString(),
      data: [
        { label: 'Metric 1', value: Math.floor(Math.random() * 100) },
        { label: 'Metric 2', value: Math.floor(Math.random() * 100) },
        { label: 'Metric 3', value: Math.floor(Math.random() * 100) },
      ]
    };
    setGeneratedReport(report);
  };

  const handleDownloadPDF = () => {
    if (!generatedReport) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Generated Report', 10, 15);
    doc.setFontSize(12);
    doc.text(`Type: ${generatedReport.type}`, 10, 25);
    doc.text(`Category: ${generatedReport.category}`, 10, 32);
    doc.text(`Date Range: ${generatedReport.startDate || '-'} to ${generatedReport.endDate || '-'}`, 10, 39);
    doc.text(`Generated At: ${generatedReport.generatedAt}`, 10, 46);
    doc.text('Data:', 10, 56);
    generatedReport.data.forEach((row, idx) => {
      doc.text(`${row.label}: ${row.value}`, 15, 66 + idx * 8);
    });
    doc.save('report.pdf');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome To General Manager Panel</h1>
          <div className="user-info">
            <span>{user.fullName}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-nav">
        <button 
          className={activeSection === 'orders' ? 'active' : ''}
          onClick={() => setActiveSection('orders')}
        >
          Review Pending Orders
        </button>
        <button 
          className={activeSection === 'suppliers' ? 'active' : ''}
          onClick={() => setActiveSection('suppliers')}
        >
          Supplier & Client Tracking
        </button>
        <button 
          className={activeSection === 'reports' ? 'active' : ''}
          onClick={() => setActiveSection('reports')}
        >
          Reports Generator
        </button>
      </div>

      <div className="dashboard-content">
        {activeSection === 'orders' && (
          <div className="orders-section">
            <div className="metrics-row">
              <div className="metric-card">
                <h3>On Time Delivery</h3>
                <div className="metric-value">85%</div>
              </div>
              <div className="metric-card">
                <h3>Cost Vs Budget</h3>
                <div className="metric-value">Within Range</div>
              </div>
              <div className="metric-card">
                <h3>Trends</h3>
                <div className="metric-value">Improving</div>
              </div>
            </div>

            <div className="pending-orders">
              <h3>Review Pending Orders</h3>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Supplier Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.supplier}</td>
                      <td>{order.date}</td>
                      <td>
                        <span className={`status ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`action-btn ${order.action.toLowerCase()}`}
                          onClick={() => handleOrderAction(order.id, order.action)}
                        >
                          {order.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'suppliers' && (
          <div className="suppliers-section">
            <div className="section-header">
              <h3>Supplier Reliability</h3>
              <div className="filters">
                <select>
                  <option>Clients</option>
                  <option>All Clients</option>
                </select>
                <select>
                  <option>Suppliers</option>
                  <option>All Suppliers</option>
                </select>
                <select>
                  <option>Any</option>
                  <option>Category A</option>
                  <option>Category B</option>
                </select>
              </div>
            </div>

            <table className="suppliers-table">
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Category</th>
                  <th>Reliability Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, index) => (
                  <tr key={index}>
                    <td>{supplier.name}</td>
                    <td>{supplier.category}</td>
                    <td>{supplier.reliability}</td>
                    <td>
                      <span className={`status ${supplier.status.toLowerCase().replace(' ', '-')}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="fulfillment-tracker">
              <h3>Order Fulfillment Tracker</h3>
              <div className="fulfillment-stages">
                <div className="stage active">
                  <div className="stage-icon">1</div>
                  <span>Pending</span>
                </div>
                <div className="stage active">
                  <div className="stage-icon">2</div>
                  <span>Processing</span>
                </div>
                <div className="stage">
                  <div className="stage-icon">3</div>
                  <span>Shipped</span>
                </div>
                <div className="stage">
                  <div className="stage-icon">4</div>
                  <span>Delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="reports-section">
            <h3>Reports Generator</h3>
            <div className="report-generator">
              <form className="generator-form" onSubmit={handleGenerateReport}>
                <div className="form-row">
                  <select value={reportType} onChange={e => setReportType(e.target.value)}>
                    <option>Supplier Performance</option>
                    <option>Order Status</option>
                    <option>Financial Summary</option>
                  </select>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start Date" />
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End Date" />
                </div>
                <div className="form-row">
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option>All Categories</option>
                    <option>Category A</option>
                    <option>Category B</option>
                  </select>
                  <button className="generate-btn" type="submit">Generate Report</button>
                </div>
              </form>
            </div>
            {generatedReport && (
              <div className="generated-report" style={{marginTop: 32, background: '#f7fafc', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(102,126,234,0.08)'}}>
                <h4>Generated Report</h4>
                <p><strong>Type:</strong> {generatedReport.type}</p>
                <p><strong>Category:</strong> {generatedReport.category}</p>
                <p><strong>Date Range:</strong> {generatedReport.startDate || '-'} to {generatedReport.endDate || '-'}</p>
                <p><strong>Generated At:</strong> {generatedReport.generatedAt}</p>
                <ul>
                  {generatedReport.data.map((row, idx) => (
                    <li key={idx}><strong>{row.label}:</strong> {row.value}</li>
                  ))}
                </ul>
                <button className="action-btn" onClick={handleDownloadPDF} style={{marginTop: 16}}>Download as PDF</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralManagerDashboard;
