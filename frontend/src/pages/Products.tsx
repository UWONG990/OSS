import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
  images?: string[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface ProductsResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    from: 0,
    to: 0
  });
  const [perPage, setPerPage] = useState(12);

  useEffect(() => {
    fetchProducts(1);
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [searchTerm, selectedCategory, sortBy, perPage]);

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (sortBy !== 'name') {
        const [sort, direction] = sortBy === 'price-low' ? ['price', 'asc'] : 
                                 sortBy === 'price-high' ? ['price', 'desc'] : 
                                 ['name', 'asc'];
        params.append('sort_by', sort);
        params.append('sort_direction', direction);
      }

      const response = await axios.get(`http://localhost:8000/api/products?${params}`);
      const data: ProductsResponse = response.data;
      
      setProducts(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
        from: data.from,
        to: data.to
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories');
      setCategories(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const { current_page, last_page } = pagination;

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(current_page - 1)}
        disabled={current_page === 1}
        style={{
          padding: '8px 12px',
          margin: '0 2px',
          border: '1px solid #ddd',
          backgroundColor: current_page === 1 ? '#f5f5f5' : '#fff',
          cursor: current_page === 1 ? 'not-allowed' : 'pointer',
          borderRadius: '4px'
        }}
      >
        Previous
      </button>
    );

    // Page numbers
    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(last_page, current_page + 2);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          style={{
            padding: '8px 12px',
            margin: '0 2px',
            border: '1px solid #ddd',
            backgroundColor: i === current_page ? '#0066cc' : '#fff',
            color: i === current_page ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          {i}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(current_page + 1)}
        disabled={current_page === last_page}
        style={{
          padding: '8px 12px',
          margin: '0 2px',
          border: '1px solid #ddd',
          backgroundColor: current_page === last_page ? '#f5f5f5' : '#fff',
          cursor: current_page === last_page ? 'not-allowed' : 'pointer',
          borderRadius: '4px'
        }}
      >
        Next
      </button>
    );

    return buttons;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Our Products</h1>
      
      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '30px', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            flex: '1',
            minWidth: '200px'
          }}
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: '150px'
          }}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: '150px'
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>

        <select
          value={perPage}
          onChange={(e) => setPerPage(parseInt(e.target.value))}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: '120px'
          }}
        >
          <option value={12}>12 per page</option>
          <option value={24}>24 per page</option>
          <option value={36}>36 per page</option>
          <option value={48}>48 per page</option>
        </select>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: '20px', color: '#666' }}>
        Showing {pagination.from} to {pagination.to} of {pagination.total} products
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No products found matching your criteria.
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {products.map(product => (
            <div key={product.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              height: '500px' // Fixed height for consistency
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Product Image */}
              <div style={{ 
                width: '100%', 
                height: '200px', 
                marginBottom: '15px',
                borderRadius: '4px',
                overflow: 'hidden'
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
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
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
                    color: '#999'
                  }}>
                    No Image
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '10px' }}>
                {product.is_featured && (
                  <span style={{
                    backgroundColor: '#ff4444',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    FEATURED
                  </span>
                )}
              </div>
              
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                <Link 
                  to={`/products/${product.id}`}
                  style={{ textDecoration: 'none', color: '#333' }}
                >
                  {product.name}
                </Link>
              </h3>
              
              <p style={{ 
                color: '#666', 
                fontSize: '14px', 
                margin: '0 0 10px 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flex: '1' // Take remaining space
              }}>
                {product.description}
              </p>
              
              <div style={{ marginBottom: '10px' }}>
                <span style={{
                  backgroundColor: '#e9f5ff',
                  color: '#0066cc',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {product.category?.name}
                </span>
              </div>
              
              {/* This div will push the button to the bottom */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#0066cc' 
                  }}>
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {product.quantity > 0 ? (
                      <span style={{ color: '#22aa22' }}>
                        {product.quantity} in stock
                      </span>
                    ) : (
                      <span style={{ color: '#cc0000' }}>
                        Out of stock
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  disabled={product.quantity === 0}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: product.quantity > 0 ? '#0066cc' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: product.quantity > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {pagination.last_page > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginTop: '30px',
            gap: '10px'
          }}>
            <div style={{ marginRight: '20px', color: '#666' }}>
              Page {pagination.current_page} of {pagination.last_page}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </>
      )}
    </div>
  );
};

export default Products;