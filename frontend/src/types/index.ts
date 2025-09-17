// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Product and Category interfaces
export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  image?: string;
  is_active: boolean;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  slug: string;
  price: string;
  quantity: number;
  sku: string;
  images?: string[];
  category_id: number;
  category?: Category;
  is_active: boolean;
  is_featured: boolean;
  weight?: string;
  dimensions?: string;
  created_at: string;
  updated_at: string;
}

// User and Authentication interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  address?: any;
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

// Cart interfaces
export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

// Order interfaces
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  total_amount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  billing_address: any;
  shipping_address: any;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// API Response interfaces
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}