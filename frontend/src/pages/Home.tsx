import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../services/products';
import { Product, Category } from '../types';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '../services/cache';
import './Home.css';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try cache first
        const cachedFeatured = cacheService.get(CACHE_KEYS.FEATURED_PRODUCTS);
        const cachedCategories = cacheService.get(CACHE_KEYS.CATEGORIES);

        if (cachedFeatured && cachedCategories) {
          setFeaturedProducts(cachedFeatured);
          setCategories(cachedCategories);
          setLoading(false);
          return;
        }

        // Fetch featured products if not cached
        if (!cachedFeatured) {
          const productsResponse = await productService.getProducts({ 
            featured: true
          });
          const featuredData = productsResponse.data.slice(0, 6);
          setFeaturedProducts(featuredData);
          
          // Cache for 10 minutes
          cacheService.set(CACHE_KEYS.FEATURED_PRODUCTS, featuredData, {
            ttl: CACHE_TTL.MEDIUM * 2,
            useMemory: true,
            useLocalStorage: true
          });
        } else {
          setFeaturedProducts(cachedFeatured);
        }

        // Fetch categories if not cached
        if (!cachedCategories) {
          const categoriesResponse = await categoryService.getCategories();
          const categoriesData = categoriesResponse.slice(0, 6);
          setCategories(categoriesData);
          
          // Cache categories for 15 minutes
          cacheService.set(CACHE_KEYS.CATEGORIES, categoriesData, {
            ttl: CACHE_TTL.LONG,
            useMemory: true,
            useLocalStorage: true
          });
        } else {
          setCategories(cachedCategories);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to OSS</h1>
          <p>Your one-stop online shopping destination</p>
          <Link to="/products" className="hero-cta">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.id}`}
              className="category-card"
            >
              <div className="category-image">
                {category.image ? (
                  <img src={category.image} alt={category.name} />
                ) : (
                  <div className="category-placeholder">{category.name[0]}</div>
                )}
              </div>
              <h3>{category.name}</h3>
              <p>{category.products_count || 0} products</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <Link to={`/products/${product.id}`}>
                <div className="product-image">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className="product-placeholder">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">${product.price}</p>
                  <p className="product-category">{product.category?.name}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
        {featuredProducts.length > 0 && (
          <div className="section-cta">
            <Link to="/products" className="view-all-btn">
              View All Products
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;