import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  description: string;
  slug: string;
  price: string;
  quantity: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  weight?: string;
  dimensions?: any;
  images?: string[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
  shop?: {
    id: number;
    name: string;
    description: string;
    status: string;
    owner: {
      id: number;
      name: string;
      email: string;
    };
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
      setLoading(false);
    } catch (err) {
      setError('Product not found');
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    if (!product) {
      alert('Product not available');
      return;
    }

    if (quantity <= 0 || quantity > product.quantity) {
      alert(`Please select a quantity between 1 and ${product.quantity}`);
      return;
    }

    try {
      await addToCart({
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: quantity,
        image: product.images?.[0] || '',
        shop_id: product.shop?.id || 0,
        shop_name: product.shop?.name || 'Unknown Shop'
      });
      
      alert(`Added ${quantity} ${product.name} to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
        <button 
          onClick={() => navigate('/products')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        <span 
          onClick={() => navigate('/products')}
          style={{ cursor: 'pointer', color: '#0066cc' }}
        >
          Products
        </span>
        {' > '}
        <span 
          onClick={() => navigate(`/products?category=${product.category.id}`)}
          style={{ cursor: 'pointer', color: '#0066cc' }}
        >
          {product.category.name}
        </span>
        {' > '}
        <span>{product.name}</span>
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Product Image */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{
            width: '100%',
            height: '400px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #ddd'
          }}>
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}>
                No Image Available
              </div>
            )}
          </div>
          
          {/* Additional Images */}
          {product.images && product.images.length > 1 && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginTop: '10px',
              overflowX: 'auto'
            }}>
              {product.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 2}`}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          {/* Featured Badge */}
          {product.is_featured && (
            <div style={{ marginBottom: '10px' }}>
              <span style={{
                backgroundColor: '#ff4444',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                FEATURED PRODUCT
              </span>
            </div>
          )}

          {/* Product Name */}
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#333' }}>
            {product.name}
          </h1>

          {/* Category */}
          <div style={{ marginBottom: '15px' }}>
            <span style={{
              backgroundColor: '#e9f5ff',
              color: '#0066cc',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {product.category.name}
            </span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#0066cc' 
            }}>
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>

          {/* SKU */}
          <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
            <strong>SKU:</strong> {product.sku}
          </div>

          {/* Stock Status */}
          <div style={{ marginBottom: '20px' }}>
            {product.quantity > 0 ? (
              <span style={{ color: '#22aa22', fontWeight: 'bold' }}>
                ✓ {product.quantity} in stock
              </span>
            ) : (
              <span style={{ color: '#cc0000', fontWeight: 'bold' }}>
                ✗ Out of stock
              </span>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px' }}>Description</h3>
            <p style={{ lineHeight: '1.6', color: '#666' }}>
              {product.description}
            </p>
          </div>

          {/* Additional Info */}
          {(product.weight || product.dimensions) && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Specifications</h3>
              {product.weight && (
                <div style={{ marginBottom: '5px', fontSize: '14px' }}>
                  <strong>Weight:</strong> {product.weight}
                </div>
              )}
              {product.dimensions && (
                <div style={{ marginBottom: '5px', fontSize: '14px' }}>
                  <strong>Dimensions:</strong> {JSON.stringify(product.dimensions)}
                </div>
              )}
            </div>
          )}

          {/* Shop Information */}
          {product.shop && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginBottom: '10px', color: '#333' }}>Sold by</h3>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ fontSize: '18px', color: '#0066cc' }}>
                  {product.shop.name}
                </strong>
              </div>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                {product.shop.description}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <strong>Shop Owner:</strong> {product.shop.owner.name}
              </div>
              <div style={{ marginTop: '10px' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#fff',
                    border: '1px solid #0066cc',
                    borderRadius: '4px',
                    color: '#0066cc',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0066cc';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.color = '#0066cc';
                  }}
                >
                  Visit Shop
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Section */}
          {product.quantity > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
                  Quantity:
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  {Array.from({ length: Math.min(product.quantity, 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Add to Cart - ${(parseFloat(product.price) * quantity).toFixed(2)}
              </button>
            </div>
          )}

          {/* Back Button */}
          <button 
            onClick={() => navigate('/products')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Back to Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;