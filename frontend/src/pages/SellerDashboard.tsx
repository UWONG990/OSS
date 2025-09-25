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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

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
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!newProduct.name.trim()) {
        throw new Error('Product name is required');
      }
      if (!newProduct.description.trim()) {
        throw new Error('Product description is required');
      }
      if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
        throw new Error('Price must be greater than 0');
      }
      if (!newProduct.quantity || parseInt(newProduct.quantity) < 0) {
        throw new Error('Quantity cannot be negative');
      }

      const formData = new FormData();
      formData.append('name', newProduct.name.trim());
      formData.append('description', newProduct.description.trim());
      formData.append('price', newProduct.price);
      formData.append('quantity', newProduct.quantity);
      formData.append('category_id', newProduct.category_id);
      
      // Add images to form data
      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      console.log('Submitting product with', selectedImages.length, 'images');

      // Use the correct endpoint
      const response = await api.post('/seller/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Product created successfully:', response.data);
      
      // Reset form
      setShowAddProduct(false);
      setNewProduct({ name: '', description: '', price: '', quantity: '', category_id: '1' });
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setError('');
      
      // Refresh the products list
      fetchProducts();
      
    } catch (err: any) {
      console.error('Error creating product:', err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to add product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    
    let errorMessages = [];
    
    const validFiles = fileArray.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        errorMessages.push(`${file.name}: Invalid file type. Only JPEG, PNG, JPG, GIF, and WebP are allowed.`);
        return false;
      }
      if (file.size > maxFileSize) {
        errorMessages.push(`${file.name}: File too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    // Check if adding these files would exceed the limit
    const totalFiles = selectedImages.length + validFiles.length;
    if (totalFiles > 5) {
      const allowedFiles = validFiles.slice(0, 5 - selectedImages.length);
      errorMessages.push(`Only ${allowedFiles.length} files were added. Maximum 5 images allowed.`);
      setSelectedImages(prev => [...prev, ...allowedFiles]);
      
      // Create preview URLs for allowed files only
      allowedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviewUrls(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      setSelectedImages(prev => [...prev, ...validFiles]);
      
      // Create preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviewUrls(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }

    if (errorMessages.length > 0) {
      setError(errorMessages.join(' '));
    } else {
      setError(''); // Clear any previous errors
    }

    // Clear the input to allow selecting the same files again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
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

              {/* Image Upload Section */}
              <div style={{ marginBottom: '15px' }}>
                <label>Product Images (Max 5):</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{
                    width: '100%',
                    padding: '8px',
                    margin: '5px 0',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                
                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '10px', 
                    marginTop: '10px' 
                  }}>
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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