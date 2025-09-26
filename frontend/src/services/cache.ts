interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default 5 minutes
  useMemory?: boolean; // Use memory cache (faster but lost on refresh)
  useLocalStorage?: boolean; // Use localStorage (persists across sessions)
}

class CacheService {
  private memoryCache: Map<string, CacheItem> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set cache with options
   */
  set(key: string, data: any, options: CacheOptions = {}): void {
    const {
      ttl = this.defaultTTL,
      useMemory = true,
      useLocalStorage = false
    } = options;

    const cacheItem: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Store in memory cache
    if (useMemory) {
      this.memoryCache.set(key, cacheItem);
    }

    // Store in localStorage
    if (useLocalStorage) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn('Failed to store in localStorage:', error);
      }
    }
  }

  /**
   * Get cached data
   */
  get(key: string): any | null {
    // Try memory cache first (faster)
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const item: CacheItem = JSON.parse(stored);
        if (this.isValid(item)) {
          // Restore to memory cache
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          // Remove expired item
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
    }

    return null;
  }

  /**
   * Check if cache item is still valid
   */
  private isValid(item: CacheItem): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * Remove specific cache entry
   */
  remove(key: string): void {
    this.memoryCache.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    
    // Clear localStorage cache items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    // Clean memory cache
    const keysToDelete: string[] = [];
    this.memoryCache.forEach((item, key) => {
      if (!this.isValid(item)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.memoryCache.delete(key));

    // Clean localStorage cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          if (!this.isValid(item)) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key); // Remove invalid JSON
        }
      }
    });
  }

  /**
   * Get or fetch data with caching
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch new data
    try {
      const data = await fetchFn();
      this.set(key, data, options);
      return data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Cache key constants
export const CACHE_KEYS = {
  PRODUCTS: (page: number, search?: string, category?: string, sortBy?: string) =>
    `products_${page}_${search || ''}_${category || ''}_${sortBy || ''}`,
  CATEGORIES: 'categories',
  USER_DATA: 'user_data',
  SHOP_REQUESTS: 'shop_requests',
  ADMIN_ORDERS: 'admin_orders',
  USER_ORDERS: (userId: number, status?: string) => `user_orders_${userId}_${status || 'all'}`,
  PRODUCT_DETAIL: (id: string) => `product_${id}`,
  SELLER_PRODUCTS: 'seller_products',
  FEATURED_PRODUCTS: 'featured_products'
};

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes  
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000  // 1 hour
};

// Helper function to clear user-specific caches
export const clearUserCaches = (userId: number) => {
  // Clear all user order variations
  const statuses = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  statuses.forEach(status => {
    cacheService.remove(CACHE_KEYS.USER_ORDERS(userId, status));
  });
  
  // Clear other user-related caches if needed
  cacheService.remove(CACHE_KEYS.USER_DATA);
};

// Utility function to refresh orders from anywhere in the app
export const refreshUserOrders = () => {
  // Dispatch custom event that Orders component listens to
  window.dispatchEvent(new CustomEvent('refreshOrders'));
};

// Auto cleanup every 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);