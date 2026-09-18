import axiosInstance from './axiosInstance';

/**
 * ============================================================================
 * SKILLFORGE AUTHENTICATION API MODULE
 * ============================================================================
 * 
 * Provides HTTP client methods to communicate with Spring Boot AuthController endpoints.
 * Base URL: /api/auth
 */

/**
 * Register a new user in the SkillForge platform.
 * 
 * Endpoint: POST /api/auth/signup
 * 
 * Example Request Payload:
 * {
 *   "name": "Test User",
 *   "email": "user@example.com",
 *   "password": "Password@123",
 *   "confirmPassword": "Password@123"
 * }
 * 
 * Example Success Response (HTTP 201):
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiJ9...",
 *     "tokenType": "Bearer",
 *     "name": "Test User",
 *     "email": "user@example.com",
 *     "role": "USER",
 *     "userId": 5
 *   },
 *   "timestamp": "2026-09-18T12:00:00"
 * }
 * 
 * @param {object} signupData - User registration data
 * @returns {Promise<object>} - Backend ApiResponse object
 */
export const signup = (signupData) => {
  return axiosInstance.post('/auth/signup', signupData);
};

/**
 * Authenticate existing user credentials and retrieve a JWT Bearer token.
 * 
 * Endpoint: POST /api/auth/login
 * 
 * Example Request Payload:
 * {
 *   "email": "user@example.com",
 *   "password": "Password@123"
 * }
 * 
 * Example Success Response (HTTP 200):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiJ9...",
 *     "tokenType": "Bearer",
 *     "name": "Test User",
 *     "email": "user@example.com",
 *     "role": "USER",
 *     "userId": 5
 *   },
 *   "timestamp": "2026-09-18T12:00:00"
 * }
 * 
 * @param {object} loginData - Login credentials { email, password }
 * @returns {Promise<object>} - Backend ApiResponse object
 */
export const login = (loginData) => {
  return axiosInstance.post('/auth/login', loginData);
};

/**
 * Optional server-side session cleanup (stateless JWT doesn't require backend state,
 * but endpoint is provided for clean architecture and client token discarding).
 * 
 * @returns {Promise<object>}
 */
export const logout = () => {
  return Promise.resolve({ success: true, message: 'Logged out successfully' });
};

/**
 * Fetch authenticated user's current profile from backend.
 * Endpoint: GET /api/users/profile
 * 
 * @returns {Promise<object>}
 */
export const getCurrentUser = () => {
  return axiosInstance.get('/users/profile');
};

export const authApi = {
  signup,
  login,
  logout,
  getCurrentUser,
};

export default authApi;
