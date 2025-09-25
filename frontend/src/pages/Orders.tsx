import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    id: number;
    name: string;
    images?: string[];
    shop?: {
      id: number;
      name: string;
    };
  };
}

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address?: any;
  billing_address?: any;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  orderItems: OrderItem[];
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const statusColors: { [key: string]: string } = {
    pending: '#ffc107',
    confirmed: '#007bff',
    processing: '#17a2b8',
    shipped: '#6f42c1',
    delivered: '#28a745',
    cancelled: '#dc3545',
    rejected: '#dc3545'
  };

  const paymentStatusColors: { [key: string]: string } = {
    pending: '#ffc107',
    completed: '#28a745',
    failed: '#dc3545',
    refunded: '#6c757d'
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = selectedStatus ? `?status=${selectedStatus}` : '';
      const response = await api.get(`/orders${params}`);
      setOrders(response.data.data || response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (orderId: number, orderNumber: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download invoice');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div>Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <h1>My Orders</h1>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: 'white',
            minWidth: '150px'
          }}
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

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

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          color: '#666'
        }}>
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {/* Order Header */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderBottom: '1px solid #ddd'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                      Order #{order.order_number}
                    </h3>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                      Placed on {formatDate(order.created_at)}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span
                        style={{
                          backgroundColor: statusColors[order.status] || '#6c757d',
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
                          backgroundColor: paymentStatusColors[order.payment_status] || '#6c757d',
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
                      marginBottom: '10px'
                    }}>
                      {formatCurrency(order.total_amount)}
                    </div>
                    {order.payment_status === 'completed' && (
                      <button
                        onClick={() => downloadInvoice(order.id, order.order_number)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 15px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Download Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
                  Items ({order.orderItems.length})
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product_name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <span style={{ color: '#6c757d', fontSize: '12px' }}>No Image</span>
                        )}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 5px 0', color: '#333' }}>
                          {item.product_name}
                        </h5>
                        <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                          SKU: {item.product_sku}
                        </p>
                        {item.product?.shop && (
                          <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                            Sold by: {item.product.shop.name}
                          </p>
                        )}
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                          Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: 'bold', 
                          color: '#007bff' 
                        }}>
                          {formatCurrency(item.total_price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div style={{ 
                  marginTop: '20px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid #ddd' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    maxWidth: '300px', 
                    marginLeft: 'auto' 
                  }}>
                    <div>
                      <div style={{ marginBottom: '8px' }}>Subtotal:</div>
                      {order.tax_amount > 0 && (
                        <div style={{ marginBottom: '8px' }}>Tax:</div>
                      )}
                      {order.shipping_amount > 0 && (
                        <div style={{ marginBottom: '8px' }}>Shipping:</div>
                      )}
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '18px',
                        borderTop: '1px solid #ddd',
                        paddingTop: '8px'
                      }}>
                        Total:
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: '8px' }}>
                        {formatCurrency(order.subtotal)}
                      </div>
                      {order.tax_amount > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          {formatCurrency(order.tax_amount)}
                        </div>
                      )}
                      {order.shipping_amount > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          {formatCurrency(order.shipping_amount)}
                        </div>
                      )}
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '18px', 
                        color: '#007bff',
                        borderTop: '1px solid #ddd',
                        paddingTop: '8px'
                      }}>
                        {formatCurrency(order.total_amount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div style={{ 
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '5px',
                    borderLeft: '4px solid #007bff'
                  }}>
                    <strong>Order Notes:</strong> {order.notes}
                  </div>
                )}

                {order.admin_notes && (
                  <div style={{ 
                    marginTop: '10px',
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '5px',
                    borderLeft: '4px solid #ffc107'
                  }}>
                    <strong>Admin Notes:</strong> {order.admin_notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;