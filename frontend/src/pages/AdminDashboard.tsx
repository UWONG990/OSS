import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shop } from '../types';
import api from '../services/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [shopRequests, setShopRequests] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'shops' | 'orders'>('shops');
  const [orders, setOrders] = useState<any[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);

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
      fetchShopRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to approve shop');
    }
  };

  const handleRejectShop = async (shopId: number) => {
    try {
      await api.delete(`/admin/shops/${shopId}/reject`);
      fetchShopRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reject shop');
    }
  };

  const fetchOrders = async () => {
    setOrderLoading(true);
    try {
      console.log('Fetching admin orders...');
      console.log('Current user:', user);
      console.log('Token:', localStorage.getItem('token'));
      
      const response = await api.get('/admin/orders');
      console.log('Admin orders response:', response.data);
      
      setOrders(response.data.data || response.data);
    } catch (err: any) {
      console.error('Admin orders fetch error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    try {
      await api.post(`/orders/${orderId}/approve`);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to approve order');
    }
  };

  const handleRejectOrder = async (orderId: number, reason: string) => {
    try {
      await api.post(`/orders/${orderId}/reject`, { rejection_reason: reason });
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reject order');
    }
  };

  useEffect(() => {
    if (activeTab === 'shops') {
      fetchShopRequests();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome Admin {user?.name}!</p>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Debug: User role: {user?.role} | Is authenticated: {!!user} | Token exists: {!!localStorage.getItem('token')}
      </p>

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #ddd', 
        marginBottom: '30px' 
      }}>
        <button
          onClick={() => setActiveTab('shops')}
          style={{
            padding: '15px 30px',
            border: 'none',
            backgroundColor: activeTab === 'shops' ? '#007bff' : 'transparent',
            color: activeTab === 'shops' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '5px 5px 0 0',
            marginRight: '5px'
          }}
        >
          Shop Requests
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '15px 30px',
            border: 'none',
            backgroundColor: activeTab === 'orders' ? '#007bff' : 'transparent',
            color: activeTab === 'orders' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '5px 5px 0 0'
          }}
        >
          Order Management
        </button>
      </div>

      {/* Shop Requests Tab */}
      {activeTab === 'shops' && (
        <div>
          <h2>Shop Registration Requests</h2>
          {loading ? (
            <p>Loading shop requests...</p>
          ) : shopRequests.length === 0 ? (
            <p>No pending shop requests.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {shopRequests.map((shop) => (
                <div
                  key={shop.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    backgroundColor: 'white',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{shop.name}</h3>
                      <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                        <strong>Owner:</strong> {shop.owner?.name}
                      </p>
                      <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                        <strong>Email:</strong> {shop.owner?.email}
                      </p>
                      <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                        <strong>Description:</strong> {shop.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleApproveShop(shop.id)}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
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
                          padding: '10px 20px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2>Order Management</h2>
          {orderLoading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders
                .filter(order => order.status === 'pending' || order.status === 'confirmed')
                .map((order) => (
                  <div
                    key={order.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '10px',
                      backgroundColor: 'white',
                      padding: '20px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                          Order #{order.order_number}
                        </h3>
                        <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                          Customer: {order.user?.name || 'Unknown'}
                        </p>
                        <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                          Placed: {formatDate(order.created_at)}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span
                            style={{
                              backgroundColor: order.status === 'pending' ? '#ffc107' : '#007bff',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}
                          >
                            {order.status}
                          </span>
                          <span
                            style={{
                              backgroundColor: order.payment_status === 'completed' ? '#28a745' : '#ffc107',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}
                          >
                            Payment: {order.payment_status}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: '#007bff',
                          marginBottom: '15px'
                        }}>
                          {formatCurrency(order.total_amount)}
                        </div>
                        
                        {order.status === 'pending' && order.payment_status === 'completed' && (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleApproveOrder(order.id)}
                              style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '8px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason:');
                                if (reason) handleRejectOrder(order.id, reason);
                              }}
                              style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '8px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div style={{ 
                      backgroundColor: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '5px',
                      marginTop: '15px'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        Items ({order.orderItems?.length || 0})
                      </h4>
                      {order.orderItems?.slice(0, 3).map((item: any) => (
                        <div key={item.id} style={{ 
                          marginBottom: '5px',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{item.product_name} (x{item.quantity})</span>
                          <span>{formatCurrency(item.total_price)}</span>
                        </div>
                      ))}
                      {order.orderItems?.length > 3 && (
                        <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                          ... and {order.orderItems.length - 3} more items
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <div style={{ 
                        marginTop: '15px',
                        padding: '10px',
                        backgroundColor: '#e7f3ff',
                        borderRadius: '5px',
                        borderLeft: '4px solid #007bff'
                      }}>
                        <strong>Order Notes:</strong> {order.notes}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;