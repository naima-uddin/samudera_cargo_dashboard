// lib/axios.js - Optimized axios instance
import axios from 'axios';
import { getAuthToken, logout } from '@/utils/SessionHelper';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.samuderathai.com/api/v1',
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
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
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

export default axiosInstance;