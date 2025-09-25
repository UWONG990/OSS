import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1>Shopping Cart</h1>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '40px',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h2 style={{ color: '#666', marginBottom: '20px' }}>Your cart is empty</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link 
            to="/products"
            style={{
              display: 'inline-block',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>Shopping Cart ({cart.itemCount} items)</h1>
        <button
          onClick={clearCart}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Cart Items */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #ddd',
          overflow: 'hidden'
        }}>
          {cart.items.map((item) => (
            <div key={item.id} style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              display: 'grid',
              gridTemplateColumns: '100px 1fr auto auto auto',
              gap: '20px',
              alignItems: 'center'
            }}>
              {/* Product Image */}
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '12px'
                  }}>
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                  {item.name}
                </h3>
                {item.shop_name && (
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: '#666', 
                    fontSize: '14px' 
                  }}>
                    Sold by: {item.shop_name}
                  </p>
                )}
                {item.sku && (
                  <p style={{ 
                    margin: '0', 
                    color: '#999', 
                    fontSize: '12px' 
                  }}>
                    SKU: {item.sku}
                  </p>
                )}
              </div>

              {/* Quantity Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  -
                </button>
                <span style={{
                  minWidth: '40px',
                  textAlign: 'center',
                  fontSize: '16px'
                }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  disabled={item.quantity >= (item.max_quantity || 99999)}
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '32px',
                    height: '32px',
                    cursor: item.quantity >= (item.max_quantity || 99999) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: item.quantity >= (item.max_quantity || 99999) ? 0.5 : 1
                  }}
                >
                  +
                </button>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#007bff' 
                }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#666' 
                }}>
                  ${item.price.toFixed(2)} each
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.product_id)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '20px',
          alignItems: 'start'
        }}>
          <div>
            <Link 
              to="/products"
              style={{
                display: 'inline-block',
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            >
              ← Continue Shopping
            </Link>
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Order Summary</h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingTop: '10px',
              borderTop: '1px solid #eee',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>

            <Link
              to="/checkout"
              style={{
                display: 'block',
                width: '100%',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;