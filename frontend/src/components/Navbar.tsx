import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin, refreshUser } = useAuth();

  // Refresh user data when navbar loads to ensure shop info is current
  useEffect(() => {
    if (isAuthenticated && user?.user_type === 'seller') {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          OSS - Online Shopping System
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Home</Link>
          <Link to="/products" className="navbar-item">Products</Link>
          
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <>
                  <Link to="/cart" className="navbar-item">Cart</Link>
                  <Link to="/orders" className="navbar-item">Orders</Link>
                </>
              )}
              {user?.user_type === 'seller' && !isAdmin && (
                <>
                  {(() => {
                    console.log('User shop data:', user.shop); // Debug log
                    return user.shop && user.shop.status === 'approved' ? (
                      <Link to="/seller-dashboard" className="navbar-item seller-link">My Shop</Link>
                    ) : (
                      <Link to="/shop-request" className="navbar-item seller-link">Request Shop</Link>
                    );
                  })()}
                </>
              )}
              {isAdmin && (
                <Link to="/admin" className="navbar-item admin-link">Admin</Link>
              )}
              <div className="navbar-user">
                <span>Welcome, {user?.name} {isAdmin ? '(admin)' : `(${user?.user_type})`}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-item">Login</Link>
              <Link to="/register" className="navbar-item">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;