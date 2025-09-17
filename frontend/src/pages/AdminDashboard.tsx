import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome Admin {user?.name}! Admin functionality will be implemented here.</p>
      <div style={{ marginTop: '30px' }}>
        <h3>Admin Features:</h3>
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