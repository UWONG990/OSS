import React from 'react';
import { useAuth } from '../context/AuthContext';

const Orders: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>My Orders</h1>
      <p>Welcome {user?.name}! Your order history will be displayed here.</p>
    </div>
  );
};

export default Orders;