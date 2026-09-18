import axios from 'axios';
import { getToken, clearAll } from '../utils/tokenHelper';

/**
 * ============================================================================
 * SKILLFORGE AXIOS HTTP CLIENT & INTERCEPTORS
 * ============================================================================
 * 
 * Why Interceptors Are Needed:
 * 1. Centralized Authentication (Request Interceptor):
 *    Instead of manually retrieving the JWT token and attaching the 
 *    `Authorization: Bearer <token>` header on every individual API call,
 *    the request interceptor automatically injects it into all outgoing HTTP requests.
 * 
 * 2. Unwrapped Response Data (Response Interceptor - Success):
 *    Axios by default wraps the server response inside an object: `{ data, status, headers, config }`.
 *    By returning `response.data` in the interceptor, frontend components and hooks receive
 *    the backend payload directly without needing `.data` drilling.
 * 
 * 3. Unified Error Handling & Session Expiry (Response Interceptor - Error):
 *    Catches HTTP errors globally:
 *    - On 401 Unauthorized (e.g. invalid or expired JWT), it immediately purges stale credentials
 *      from localStorage and safely redirects the user to `/login`.
 *    - Categorizes 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error), and offline
 *      network failures with clear messages.
 */

// Configure base API URL with fallback to backend port 8080
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Retrieve the JWT from localStorage using tokenHelper
    const token = getToken();

    // 2. Attach Bearer token if present
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Log request in development mode for debugging
    if (import.meta.env.DEV) {
      console.log(
        `%c[HTTP REQUEST] %c${config.method?.toUpperCase()} %c${config.baseURL}${config.url}`,
        'color: #3ECFCF; font-weight: bold;',
        'color: #6C63FF; font-weight: bold;',
        'color: #CBD5E0;'
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
axiosInstance.interceptors.response.use(
  (response) => {
    // Return backend payload directly (unwrapping Axios response wrapper)
    return response.data;
  },
  (error) => {
    // Network Error (server offline, CORS preflight failure, or no internet)
    if (!error.response) {
      console.error('[Network Error] Could not connect to SkillForge backend server:', error.message);
      const networkError = new Error('Network error. Please check your connection');
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Handle specific HTTP Status Codes
    switch (status) {
      case 401: {
        // Token expired or invalid
        console.warn('[Auth 401] Unauthorized access. Clearing session and redirecting to /login.');
        clearAll();
        // Prevent redirect loop if already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
      }
      case 403: {
        console.error('[Forbidden 403] Access denied. You do not have permission for this resource.');
        break;
      }
      case 404: {
        console.error('[Not Found 404] Resource not found on server:', error.config?.url);
        break;
      }
      case 500: {
        console.error('[Server Error 500] Internal server error occurred in SkillForge backend.');
        break;
      }
      default: {
        console.error(`[HTTP Error ${status}]`, data?.message || error.message);
        break;
      }
    }

    // Extract cleanest error message from backend ApiResponse or fall back to error.message
    const errorMessage =
      data?.message ||
      data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
