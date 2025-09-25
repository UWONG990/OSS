import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Auth.css';

const ShopRequest: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Refresh user data and check shop status
  React.useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      if (user.user_type !== 'seller') {
        navigate('/');
        return;
      }

      // Refresh user data to get latest shop information
      await refreshUser();
    };

    checkUserStatus();
  }, []);

  // Separate effect to handle shop redirection after user data is refreshed
  React.useEffect(() => {
    if (!user || user.user_type !== 'seller') return;

    // If user already has a shop, redirect based on shop status
    if (user.shop) {
      if (user.shop.status === 'approved') {
        navigate('/seller-dashboard');
      } else {
        // Show message for pending/rejected shops instead of redirecting
        setError('You already have a shop request or an existing shop');
      }
      return;
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/shop/request', formData);

      setSuccess('Shop request submitted successfully! You will be notified once it is reviewed.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit shop request');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.user_type !== 'seller') {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Request to Open a Shop</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          As a seller, you can request to open your own shop. Once approved by an admin, 
          you'll be able to sell products on our platform.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message" style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px' 
        }}>{success}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Shop Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter your shop name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Shop Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Describe what your shop will sell..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Submitting Request...' : 'Submit Shop Request'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            <a href="/" style={{ textDecoration: 'none', color: '#007bff' }}>
              ← Back to Home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShopRequest;