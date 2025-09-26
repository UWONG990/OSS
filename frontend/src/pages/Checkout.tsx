import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice } from '../utils/currency';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  method: 'credit' | 'debit' | 'paypal';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardHolderName?: string;
  paypalEmail?: string;
}

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'credit',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    paypalEmail: ''
  });

  // Redirect if cart is empty
  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_info: shippingInfo,
        payment_info: {
          method: paymentInfo.method,
          // Note: In production, never send actual card details to backend
          // Use payment processor (Stripe, PayPal, etc.) tokens instead
        },
        total: cart.total
      };

      const response = await api.post('/orders', orderData);
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to order confirmation
      navigate(`/orders/${response.data.order.id}`, { 
        state: { message: 'Order placed successfully!' }
      });
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to process order');
    } finally {
      setLoading(false);
    }
  };

  const renderShippingForm = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '30px' }}>Shipping Information</h2>
      
      <form onSubmit={handleShippingSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              First Name *
            </label>
            <input
              type="text"
              required
              value={shippingInfo.firstName}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Last Name *
            </label>
            <input
              type="text"
              required
              value={shippingInfo.lastName}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email *
            </label>
            <input
              type="email"
              required
              value={shippingInfo.email}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Phone *
            </label>
            <input
              type="tel"
              required
              value={shippingInfo.phone}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Address *
          </label>
          <input
            type="text"
            required
            value={shippingInfo.address}
            onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              City *
            </label>
            <input
              type="text"
              required
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              State *
            </label>
            <input
              type="text"
              required
              value={shippingInfo.state}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              ZIP Code *
            </label>
            <input
              type="text"
              required
              value={shippingInfo.zipCode}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ← Back to Cart
          </button>
          
          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Continue to Payment →
          </button>
        </div>
      </form>
    </div>
  );

  const renderPaymentForm = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '30px' }}>Payment Information</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
        <form onSubmit={handlePaymentSubmit}>
          {/* Payment Method Selection */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Payment Method *
            </label>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              {['credit', 'debit', 'paypal'].map((method) => (
                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentInfo.method === method}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as 'credit' | 'debit' | 'paypal' }))}
                  />
                  <span style={{ textTransform: 'capitalize' }}>
                    {method === 'paypal' ? 'PayPal' : `${method} Card`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Card Payment Form */}
          {(paymentInfo.method === 'credit' || paymentInfo.method === 'debit') && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  required
                  value={paymentInfo.cardHolderName}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardHolderName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Card Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="1234 5678 9012 3456"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => {
                    // Format card number with spaces
                    const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                    setPaymentInfo(prev => ({ ...prev, cardNumber: value }));
                  }}
                  maxLength={19}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                      setPaymentInfo(prev => ({ ...prev, expiryDate: value }));
                    }}
                    maxLength={5}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    CVV *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* PayPal Form */}
          {paymentInfo.method === 'paypal' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                PayPal Email *
              </label>
              <input
                type="email"
                required
                value={paymentInfo.paypalEmail}
                onChange={(e) => setPaymentInfo(prev => ({ ...prev, paypalEmail: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>
          )}

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

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ← Back to Shipping
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>

        {/* Order Summary */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          height: 'fit-content'
        }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Order Summary</h3>
          
          {cart.items.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #ddd'
            }}>
              <div>
                <div style={{ fontWeight: '500' }}>{item.name}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Qty: {item.quantity} × {formatPrice(item.price)}
                </div>
              </div>
              <div style={{ fontWeight: 'bold' }}>
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '2px solid #ddd',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            <span>Total</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', minHeight: '80vh' }}>
      {/* Progress Steps */}
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto 40px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 1 ? '#007bff' : '#ddd',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              1
            </div>
            <span style={{ color: currentStep >= 1 ? '#007bff' : '#666' }}>Shipping</span>
          </div>
          
          <div style={{
            width: '50px',
            height: '2px',
            backgroundColor: currentStep >= 2 ? '#007bff' : '#ddd'
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 2 ? '#007bff' : '#ddd',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              2
            </div>
            <span style={{ color: currentStep >= 2 ? '#007bff' : '#666' }}>Payment</span>
          </div>
        </div>
      </div>

      {currentStep === 1 ? renderShippingForm() : renderPaymentForm()}
    </div>
  );
};

export default Checkout;