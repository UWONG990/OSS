import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shop } from '../types';
import api from '../services/api';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '../services/cache';
import { formatCurrency } from '../utils/currency';

// Add CSS for spinner animation
const spinnerStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject the CSS if not already added
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('#admin-spinner-style');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'admin-spinner-style';
    style.textContent = spinnerStyle;
    document.head.appendChild(style);
  }
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [shopRequests, setShopRequests] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'shops' | 'orders'>('shops');
  const [orders, setOrders] = useState<any[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderNetworkLoading, setOrderNetworkLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<{shops?: Date, orders?: Date}>({});

  const fetchShopRequests = async (useCache: boolean = true) => {
    if (useCache) {
      // Try to get from cache first
      const cached = cacheService.get(CACHE_KEYS.SHOP_REQUESTS);
      if (cached) {
        setShopRequests(cached);
        setLoading(false);
        setNetworkLoading(false);
        return;
      }
    }

    setLoading(true);
    setNetworkLoading(true);
    try {
      const response = await api.get('/admin/shop-requests/pending');
      const data = response.data;
      
      // Cache the data for 2 minutes (admin data changes frequently)
      cacheService.set(CACHE_KEYS.SHOP_REQUESTS, data, {
        ttl: CACHE_TTL.SHORT,
        useMemory: true,
        useLocalStorage: true
      });
      
      setShopRequests(data);
      setLastUpdated(prev => ({ ...prev, shops: new Date() }));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch shop requests');
    } finally {
      setLoading(false);
      setNetworkLoading(false);
    }
  };

  const handleApproveShop = async (shopId: number) => {
    try {
      await api.post(`/admin/shops/${shopId}/approve`);
      // Clear cache and refetch to get fresh data
      cacheService.remove(CACHE_KEYS.SHOP_REQUESTS);
      fetchShopRequests(false); // Force fresh fetch
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to approve shop');
    }
  };

  const handleRejectShop = async (shopId: number) => {
    try {
      await api.delete(`/admin/shops/${shopId}/reject`);
      // Clear cache and refetch to get fresh data
      cacheService.remove(CACHE_KEYS.SHOP_REQUESTS);
      fetchShopRequests(false); // Force fresh fetch
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reject shop');
    }
  };

  const fetchOrders = async (useCache: boolean = true) => {
    if (useCache) {
      // Try to get from cache first
      const cached = cacheService.get(CACHE_KEYS.ADMIN_ORDERS);
      if (cached) {
        setOrders(cached);
        setOrderLoading(false);
        setOrderNetworkLoading(false);
        return;
      }
    }

    setOrderLoading(true);
    setOrderNetworkLoading(true);
    try {
      console.log('Fetching admin orders...');
      console.log('Current user:', user);
      console.log('Token:', localStorage.getItem('token'));
      
      const response = await api.get('/admin/orders');
      console.log('Admin orders response:', response.data);
      
      const data = response.data.data || response.data;
      
      // Cache the orders for 2 minutes
      cacheService.set(CACHE_KEYS.ADMIN_ORDERS, data, {
        ttl: CACHE_TTL.SHORT,
        useMemory: true,
        useLocalStorage: true
      });
      
      setOrders(data);
      setLastUpdated(prev => ({ ...prev, orders: new Date() }));
    } catch (err: any) {
      console.error('Admin orders fetch error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setOrderLoading(false);
      setOrderNetworkLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    try {
      await api.post(`/orders/${orderId}/approve`);
      // Clear cache and refetch to get fresh data
      cacheService.remove(CACHE_KEYS.ADMIN_ORDERS);
      fetchOrders(false); // Force fresh fetch
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to approve order');
    }
  };

  const handleRejectOrder = async (orderId: number, reason: string) => {
    try {
      await api.post(`/orders/${orderId}/reject`, { rejection_reason: reason });
      // Clear cache and refetch to get fresh data
      cacheService.remove(CACHE_KEYS.ADMIN_ORDERS);
      fetchOrders(false); // Force fresh fetch
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

  // Auto-refresh data every 2 minutes for admin dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'shops') {
        // Check if cache is about to expire and refresh silently
        const cached = cacheService.get(CACHE_KEYS.SHOP_REQUESTS);
        if (!cached) {
          fetchShopRequests(false);
        }
      } else if (activeTab === 'orders') {
        const cached = cacheService.get(CACHE_KEYS.ADMIN_ORDERS);
        if (!cached) {
          fetchOrders(false);
        }
      }
    }, 2 * 60 * 1000); // Every 2 minutes

    return () => clearInterval(interval);
  }, [activeTab]);



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to refresh all admin data
  const refreshAllData = () => {
    cacheService.remove(CACHE_KEYS.SHOP_REQUESTS);
    cacheService.remove(CACHE_KEYS.ADMIN_ORDERS);
    if (activeTab === 'shops') {
      fetchShopRequests(false);
    } else {
      fetchOrders(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: '5px' }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Welcome Admin {user?.name}!</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {(networkLoading || orderNetworkLoading) && (
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#f0f8ff', 
              borderRadius: '20px', 
              fontSize: '14px',
              color: '#0066cc',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⚡</span> 
              Syncing data...
            </div>
          )}
          <button
            onClick={refreshAllData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            disabled={networkLoading || orderNetworkLoading}
          >
            🔄 Refresh All
          </button>
        </div>
      </div>
      
      <p style={{ fontSize: '12px', color: '#999', marginBottom: '30px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Shop Registration Requests</h2>
              {networkLoading && (
                <div style={{ 
                  marginLeft: '15px', 
                  padding: '5px 10px', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '15px', 
                  fontSize: '12px',
                  color: '#856404',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span> 
                  Updating...
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {lastUpdated.shops && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Updated: {lastUpdated.shops.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  cacheService.remove(CACHE_KEYS.SHOP_REQUESTS);
                  fetchShopRequests(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={networkLoading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          {loading && shopRequests.length === 0 ? (
            <p>Loading shop requests...</p>
          ) : shopRequests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              color: '#666'
            }}>
              <h4>No pending shop requests</h4>
              <p>All shop requests have been processed.</p>
            </div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Order Management</h2>
              {orderNetworkLoading && (
                <div style={{ 
                  marginLeft: '15px', 
                  padding: '5px 10px', 
                  backgroundColor: '#d1ecf1', 
                  borderRadius: '15px', 
                  fontSize: '12px',
                  color: '#0c5460',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span> 
                  Updating...
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {lastUpdated.orders && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Updated: {lastUpdated.orders.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  cacheService.remove(CACHE_KEYS.ADMIN_ORDERS);
                  fetchOrders(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={orderNetworkLoading}
              >
                🔄 Refresh Orders
              </button>
            </div>
          </div>
          {orderLoading && orders.length === 0 ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              color: '#666'
            }}>
              <h4>No orders found</h4>
              <p>No orders are currently pending approval.</p>
            </div>
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
                        Items ({(order.orderItems || order.items)?.length || 0})
                      </h4>
                      {(order.orderItems || order.items)?.slice(0, 3).map((item: any) => {
                        // Debug logging
                        console.log('Item data:', item);
                        console.log('Product data:', item.product);
                        console.log('Images data:', item.product?.images);
                        if (item.product?.images?.[0]) {
                          const rawImage = item.product.images[0];
                          const imageUrl = rawImage.startsWith('http') ? rawImage : `http://localhost:8000/storage/${rawImage}`;
                          console.log('Raw image:', rawImage);
                          console.log('Generated image URL:', imageUrl);
                        }
                        
                        return (
                        <div key={item.id} style={{ 
                          marginBottom: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}>
                          {/* Product Image */}
                          <div style={{ flexShrink: 0 }}>
                            {item.product?.images?.[0] || item.product?.image ? (
                              <>
                                <img
                                  src={(() => {
                                    const rawImage = item.product.images?.[0] || item.product.image;
                                    return rawImage?.startsWith('http') ? rawImage : `http://localhost:8000/storage/${rawImage}`;
                                  })()}
                                  alt={item.product_name}
                                  style={{
                                    width: '50px',
                                    height: '50px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    border: '1px solid #dee2e6'
                                  }}
                                  onError={(e) => {
                                    console.log('Failed to load image:', e.currentTarget.src);
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextElementSibling) {
                                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                    }
                                  }}
                                />
                                <div style={{
                                  width: '50px',
                                  height: '50px',
                                  backgroundColor: '#f8f9fa',
                                  borderRadius: '6px',
                                  border: '1px solid #dee2e6',
                                  display: 'none',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  color: '#6c757d'
                                }}>
                                  No Image
                                </div>
                              </>
                            ) : (
                              <div style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #dee2e6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                color: '#6c757d'
                              }}>
                                No Image
                              </div>
                            )}
                          </div>
                          
                          {/* Product Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontWeight: '500',
                              fontSize: '14px',
                              color: '#333',
                              marginBottom: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {item.product_name}
                            </div>
                            <div style={{ 
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              SKU: {item.product_sku} • Qty: {item.quantity}
                              {item.product?.shop && (
                                <span> • by {item.product.shop.name}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div style={{ 
                            fontWeight: '600',
                            fontSize: '14px',
                            color: '#007bff',
                            textAlign: 'right'
                          }}>
                            {formatCurrency(item.total_price)}
                            <div style={{
                              fontSize: '11px',
                              color: '#666',
                              fontWeight: '400'
                            }}>
                              {formatCurrency(item.unit_price)} each
                            </div>
                          </div>
                        </div>
                        );
                      })}
                      {(order.orderItems || order.items)?.length > 3 && (
                        <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                          ... and {(order.orderItems || order.items).length - 3} more items
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