import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shop } from '../types';
import api from '../services/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [shopRequests, setShopRequests] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchShopRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/shop-requests/pending');
      setShopRequests(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch shop requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveShop = async (shopId: number) => {
    try {
      await api.post(`/admin/shops/${shopId}/approve`);
      fetchShopRequests(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to approve shop');
    }
  };

  const handleRejectShop = async (shopId: number) => {
    try {
      await api.delete(`/admin/shops/${shopId}/reject`);
      fetchShopRequests(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reject shop');
    }
  };

  useEffect(() => {
    fetchShopRequests();
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome Admin {user?.name}!</p>

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h2>Pending Shop Requests</h2>
        {loading ? (
          <p>Loading shop requests...</p>
        ) : shopRequests.length === 0 ? (
          <p>No pending shop requests.</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {shopRequests.map((shop) => (
              <div key={shop.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fff'
              }}>
                <h3>{shop.name}</h3>
                <p><strong>Owner:</strong> {shop.owner?.name}</p>
                <p><strong>Email:</strong> {shop.owner?.email}</p>
                <p><strong>Description:</strong> {shop.description}</p>
                <p><strong>Requested:</strong> {new Date(shop.created_at).toLocaleDateString()}</p>
                
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleApproveShop(shop.id)}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleRejectShop(shop.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>Other Admin Features:</h3>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>Manage Products</li>
          <li>Manage Categories</li>
          <li>View Orders</li>
          <li>User Management</li>
          <li>Sales Analytics</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;