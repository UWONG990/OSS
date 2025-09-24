import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import api from '../services/api';

interface ShopStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  revenue: number;
}

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ShopStats>({ totalProducts: 0, activeProducts: 0, totalOrders: 0, revenue: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category_id: '1'
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/products');
      setProducts(response.data);
      
      // Calculate basic stats
      const totalProducts = response.data.length;
      const activeProducts = response.data.filter((p: Product) => p.is_active).length;
      setStats({
        totalProducts,
        activeProducts,
        totalOrders: 0, // TODO: Implement order tracking
        revenue: 0 // TODO: Implement revenue calculation
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/seller/products', {
        ...newProduct,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity)
      });
      
      setShowAddProduct(false);
      setNewProduct({ name: '', description: '', price: '', quantity: '', category_id: '1' });
      fetchProducts(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add product');
    }
  };

  const handleToggleProduct = async (productId: number, isActive: boolean) => {
    try {
      await api.put(`/seller/products/${productId}`, { is_active: !isActive });
      fetchProducts(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/seller/products/${productId}`);
        fetchProducts(); // Refresh the list
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (!user?.shop || user.shop.status !== 'approved') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Seller Dashboard</h2>
        <p>Your shop is not yet approved or doesn't exist.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>{user.shop.name} - Seller Dashboard</h1>
        <button 
          onClick={() => setShowAddProduct(true)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Add New Product
        </button>
      </div>

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

      {/* Shop Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Products</h3>
          <p style={{ fontSize: '2em', margin: '0', fontWeight: 'bold' }}>{stats.totalProducts}</p>
        </div>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Active Products</h3>
          <p style={{ fontSize: '2em', margin: '0', fontWeight: 'bold' }}>{stats.activeProducts}</p>
        </div>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Total Orders</h3>
          <p style={{ fontSize: '2em', margin: '0', fontWeight: 'bold' }}>{stats.totalOrders}</p>
        </div>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6c757d' }}>Revenue</h3>
          <p style={{ fontSize: '2em', margin: '0', fontWeight: 'bold' }}>${stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div style={{ marginBottom: '15px' }}>
                <label>Product Name:</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    margin: '5px 0',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label>Description:</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '8px',
                    margin: '5px 0',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label>Price ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    margin: '5px 0',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label>Quantity:</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    margin: '5px 0',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      <div>
        <h2>Your Products</h2>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found. Add your first product to get started!</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {products.map((product) => (
              <div key={product.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fff',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#6c757d' }}>{product.description}</p>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span><strong>Price:</strong> ${product.price}</span>
                    <span><strong>Stock:</strong> {product.quantity}</span>
                    <span style={{ 
                      color: product.is_active ? '#28a745' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleProduct(product.id, product.is_active)}
                    style={{
                      backgroundColor: product.is_active ? '#ffc107' : '#28a745',
                      color: product.is_active ? '#212529' : 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {product.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;