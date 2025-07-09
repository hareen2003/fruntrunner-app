import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import './Dashboard.css';

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('quotation');
  const [quotationData, setQuotationData] = useState({
    item: '',
    quantity: '',
    price: '',
    deliveryTime: ''
  });
  const [quotationMsg, setQuotationMsg] = useState('');
  const [shippingMsg, setShippingMsg] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [shippingFiles, setShippingFiles] = useState([]);

  const purchaseOrders = [
    { id: '003035', date: '28, April 2025', status: 'Pending', amount: '$3,552' },
    { id: '003049', date: '12, May 2025', status: 'Accept', amount: '$5,403' },
    { id: '003060', date: '03, Jun 2025', status: 'Accept', amount: '$2,457' },
    { id: '003092', date: '24, Jun 2025', status: 'Accept', amount: '$3,45' },
    { id: '003095', date: '09, July 2025', status: 'Accept', amount: '$1,154' },
    { id: '0030134', date: '11, August 2025', status: 'Accept', amount: '$4,875' },
  ];

  // --- QUOTATION SUBMIT ---
  const handleQuotationSubmit = async (e) => {
    e.preventDefault();
    setQuotationMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/suppliers/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed
        },
        credentials: 'include',
        body: JSON.stringify({ ...quotationData })
      });
      const data = await res.json();
      if (res.ok) {
        setQuotationMsg('Quotation submitted successfully!');
        setQuotationData({ item: '', quantity: '', price: '', deliveryTime: '' });
      } else {
        setQuotationMsg(data.error || 'Failed to submit quotation');
      }
    } catch (err) {
      setQuotationMsg('Failed to submit quotation');
    }
  };

  // --- SHIPPING UPLOAD ---
  const handleShippingUpload = async (e) => {
    e.preventDefault();
    setShippingMsg('');
    if (!selectedOrder || shippingFiles.length === 0) {
      setShippingMsg('Please select an order and at least one file.');
      return;
    }
    const formData = new FormData();
    formData.append('orderId', selectedOrder);
    Array.from(shippingFiles).forEach(file => formData.append('files', file));
    try {
      const res = await fetch('http://localhost:5000/api/shipping/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Add auth header if needed
      });
      const data = await res.json();
      if (res.ok) {
        setShippingMsg('Documents uploaded successfully!');
        setSelectedOrder('');
        setShippingFiles([]);
      } else {
        setShippingMsg(data.error || 'Failed to upload documents');
      }
    } catch (err) {
      setShippingMsg('Failed to upload documents');
    }
  };

  const handleInputChange = (e) => {
    setQuotationData({
      ...quotationData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back to Supplier panel</h1>
          <div className="user-info">
            <span>{user.fullName}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="supplier-nav">
        <button 
          className={activeSection === 'quotation' ? 'active' : ''}
          onClick={() => setActiveSection('quotation')}
        >
          Quotation Submission
        </button>
        <button 
          className={activeSection === 'purchase' ? 'active' : ''}
          onClick={() => setActiveSection('purchase')}
        >
          Purchase Order Management
        </button>
        <button 
          className={activeSection === 'shipping' ? 'active' : ''}
          onClick={() => setActiveSection('shipping')}
        >
          Shipping Document Upload
        </button>
        <button 
          className={activeSection === 'history' ? 'active' : ''}
          onClick={() => setActiveSection('history')}
        >
          Order History
        </button>
        <button 
          className={activeSection === 'profile' ? 'active' : ''}
          onClick={() => setActiveSection('profile')}
        >
          My Profile
        </button>
      </div>

      <div className="dashboard-content">
        {activeSection === 'quotation' && (
          <div className="quotation-section">
            <h3>Quotation Submission</h3>
            {quotationMsg && <div className={quotationMsg.includes('success') ? 'success-message' : 'error-message'}>{quotationMsg}</div>}
            <form onSubmit={handleQuotationSubmit} className="quotation-form">
              <div className="form-group">
                <label>Item</label>
                <input
                  type="text"
                  name="item"
                  value={quotationData.item}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={quotationData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={quotationData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Delivery Time (Days)</label>
                <input
                  type="number"
                  name="deliveryTime"
                  value={quotationData.deliveryTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">Submit</button>
                <button type="button" className="clear-btn" onClick={() => setQuotationData({ item: '', quantity: '', price: '', deliveryTime: '' })}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}

        {activeSection === 'purchase' && (
          <div className="purchase-section">
            <h3>Purchase Order Management</h3>
            <table className="purchase-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.date}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.amount}</td>
                    <td>
                      <button className="action-btn">View</button>
                      {order.status === 'Pending' && (
                        <button className="action-btn accept">Accept</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'shipping' && (
          <div className="shipping-section">
            <h3>Shipping Documentation</h3>
            {shippingMsg && <div className={shippingMsg.includes('success') ? 'success-message' : 'error-message'}>{shippingMsg}</div>}
            <form className="upload-form" onSubmit={handleShippingUpload}>
              <div className="form-group">
                <label>Select Order</label>
                <select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)} required>
                  <option value="">Choose Order</option>
                  {purchaseOrders.filter(order => order.status === 'Accept').map(order => (
                    <option key={order.id} value={order.id}>
                      {order.id} - {order.date}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="upload-area">
                <div className="upload-box">
                  <p>Upload File</p>
                  <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => setShippingFiles(e.target.files)} required />
                </div>
              </div>
              
              <button type="submit" className="submit-btn">Upload Documents</button>
            </form>
          </div>
        )}

        {activeSection === 'history' && (
          <div className="history-section">
            <h3>Order History</h3>
            <div className="search-bar">
              <input type="text" placeholder="Search orders..." />
            </div>
            
            <table className="history-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="profile-section">
            <h3>My Profile</h3>
            <div className="profile-info">
              <p><strong>Registered as a Supplier</strong></p>
              <div className="profile-details">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={user.fullName} readOnly />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user.email || 'supplier@example.com'} readOnly />
                </div>
                <div className="form-group">
                  <label>Contact</label>
                  <input type="tel" value={user.contact || '+1234567890'} readOnly />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value={user.role} readOnly />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;
