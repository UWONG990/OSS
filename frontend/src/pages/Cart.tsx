import React from 'react';
import { useAuth } from '../context/AuthContext';

const Cart: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Shopping Cart</h1>
      <p>Welcome {user?.name}! Your cart items will be displayed here.</p>
    </div>
  );
};

export default Cart;