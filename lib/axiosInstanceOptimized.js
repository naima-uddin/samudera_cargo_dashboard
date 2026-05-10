// lib/axiosInstanceOptimized.js - Optimized axios with caching & request deduplication
import axios from 'axios';
import { getAuthToken, logout } from '@/utils/SessionHelper';

// Cache configuration
const CACHE_CONFIG = {
  GET: {
    timeout: 5 * 60 * 1000, // 5 minutes for GET requests
    endpoints: ['getAllShipment', 'getAllTracking', 'expected-shipments', '/my-shipments', '/shipments/', '/trackings/']
  },
  POST: {
    timeout: 0 // Don't cache POST requests
  },
  PUT: {
    timeout: 0 // Don't cache PUT requests
  },
  PATCH: {
    timeout: 0 // Don't cache PATCH requests
  },
  DELETE: {
    timeout: 0 // Don't cache DELETE requests
  }
};

const requestCache = new Map();
const pendingRequests = new Map();

// Generate cache key from request config
const generateCacheKey = (config) => {
  return `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.params || {})}`;
};

// Check if cache is still valid
const isCacheValid = (cacheEntry, method) => {
  if (!cacheEntry) return false;
  const cacheTimeout = CACHE_CONFIG[method]?.timeout || 0;
  if (cacheTimeout === 0) return false; // Don't cache this method
  return Date.now() - cacheEntry.timestamp < cacheTimeout;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 120000, // 120 seconds for slower submit/quote/accept flows
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Check cache for GET requests
    if (config.method.toUpperCase() === 'GET') {
      const cacheKey = generateCacheKey(config);
      
      // Return cached response if valid
      if (isCacheValid(requestCache.get(cacheKey), config.method)) {
        config.__cachedResponse = requestCache.get(cacheKey).data;
      }

      // Deduplicate pending requests
      if (pendingRequests.has(cacheKey)) {
        config.__pendingRequest = pendingRequests.get(cacheKey);
      } else {
        // Store this request as pending
        const pendingPromise = new Promise((resolve) => {
          config.__resolvePending = resolve;
        });
        pendingRequests.set(cacheKey, pendingPromise);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const cacheKey = generateCacheKey(response.config);
    
    // Cache GET requests
    if (response.config.method.toUpperCase() === 'GET') {
      requestCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      
      // Resolve pending requests
      if (response.config.__resolvePending) {
        response.config.__resolvePending(response);
      }
      pendingRequests.delete(cacheKey);
    }

    const status = response.response?.status;
    
    if (status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        logout();
      }
    }

    return response;
  },
  (error) => {
    if (error.config) {
      const cacheKey = generateCacheKey(error.config);
      pendingRequests.delete(cacheKey);
    }

    const status = error.response?.status;
    
    if (status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        logout();
      }
    }
    
    return Promise.reject(error);
  }
);

// Utility to clear specific cache
export const clearCache = (pattern) => {
  if (!pattern) {
    requestCache.clear();
    return;
  }
  
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key);
    }
  }
};

// Utility to clear all pending requests
export const clearPendingRequests = () => {
  pendingRequests.clear();
};

export default axiosInstance;
