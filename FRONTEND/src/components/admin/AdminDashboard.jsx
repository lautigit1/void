import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <div className="admin-header">
        <h1>MANAGEMENT PANEL</h1>
        <button onClick={handleLogout} className="admin-upload-button" style={{ marginTop: '2rem' }}>
          LOGOUT
        </button>
      </div>
      <div className="admin-forms-wrapper">
        
        {/* New Sale Form */}
        <div className="admin-form-card">
          <h2>NEW SALE</h2>
          <div className="admin-form-group">
            <label htmlFor="sale-date">DATE</label>
            <input type="date" id="sale-date" />
          </div>
          <div className="admin-form-group">
            <label htmlFor="customer-name">CUSTOMER NAME</label>
            <input type="text" id="customer-name" />
          </div>
          <div className="admin-form-group">
            <label htmlFor="products-sold">PRODUCTS SOLD</label>
            <input type="text" id="products-sold" />
          </div>
          <div className="admin-form-group">
            <label htmlFor="amount-sale">AMOUNT</label>
            <input type="number" id="amount-sale" />
          </div>
          <div className="admin-form-group">
            <label htmlFor="payment-method-sale">PAYMENT METHOD</label>
            <input type="text" id="payment-method-sale" />
          </div>
          <button className="admin-upload-button">UPLOAD</button>
        </div>

        {/* New Expense Form */}
        <div className="admin-form-card">
          <h2>NEW EXPENSE</h2>
          <div className="admin-form-group">
            <label htmlFor="expense-date">DATE</label>
            <input type="date" id="expense-date" />
          </div>
          <div className="admin-form-group">
            <label htmlFor="supplier-name">SUPPLIER NAME</label>
            <input type="text" id="supplier-name" />
          </div>
          <div className="admin-form-group">
            <label htmlFor="description-expense">DESCRIPTION</label>
            <input type="text" id="description-expense" />
          </div>
          <div className="admin-form-group">
            <label htmlFor="amount-expense">AMOUNT</label>
            <input type="number" id="amount-expense" />
          </div>
          <div className="admin-form-group">
            <label htmlFor="payment-method-expense">PAYMENT METHOD</label>
            <input type="text" id="payment-method-expense" />
          </div>
          <button className="admin-upload-button">UPLOAD</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;