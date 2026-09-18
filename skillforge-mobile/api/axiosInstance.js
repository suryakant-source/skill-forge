import axios from 'axios';
import tokenHelper from '../utils/tokenHelper';

/**
 * ============================================================================
 * SkillForge Mobile - Axios API Instance
 * ============================================================================
 * Handles all REST API communications between React Native client and Spring Boot backend:
 * - Dynamic Base URL via EXPO_PUBLIC_API_BASE_URL environment variable
 * - Automatic JWT token attachment via request interceptor
 * - Unified response unpacking (returning response.data directly)
 * - Automatic session cleanup on HTTP 401 Unauthorized responses
 * - User-friendly error message resolution
 * ============================================================================
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

console.log('[API] Initializing Axios client with baseURL:', API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor:
 * Intercepts every outgoing HTTP call to inspect SecureStore for JWT token
 * and injects it into Authorization header.
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenHelper.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[Axios Request Interceptor] Failed to read token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Simplifies incoming responses and handles global authorization errors.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return backend payload directly
    return response.data;
  },
  async (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      console.warn('[Axios Response Interceptor] 401 Unauthorized - clearing credentials');
      try {
        await tokenHelper.clearAll();
      } catch (clearErr) {
        console.error('[Axios Response Interceptor] Error clearing storage:', clearErr);
      }
    }

    // Extract user-friendly error message
    const formattedMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject(new Error(formattedMessage));
  }
);

export default axiosInstance;
