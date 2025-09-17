import api from './api';
import { Product, PaginatedResponse, Category } from '../types';

export const productService = {
  async getProducts(params?: {
    search?: string;
    category?: number;
    min_price?: number;
    max_price?: number;
    featured?: boolean;
    in_stock?: boolean;
    sort_by?: string;
    sort_direction?: string;
    page?: number;
  }): Promise<PaginatedResponse<Product>> {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProduct(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await api.post('/products', productData);
    return response.data.product;
  },

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.product;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategory(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async getCategoryProducts(id: number, params?: {
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_direction?: string;
    page?: number;
  }): Promise<PaginatedResponse<Product>> {
    const response = await api.get(`/categories/${id}/products`, { params });
    return response.data;
  },

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const response = await api.post('/categories', categoryData);
    return response.data.category;
  },

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data.category;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};