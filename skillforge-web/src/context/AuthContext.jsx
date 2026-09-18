import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  saveToken,
  getToken,
  removeToken,
  saveUser,
  getUser,
  removeUser,
  clearAll,
  isTokenExpired,
} from '../utils/tokenHelper';

/**
 * ============================================================================
 * SKILLFORGE GLOBAL AUTHENTICATION CONTEXT
 * ============================================================================
 * 
 * Why AuthContext Is Needed:
 * 1. Global User State:
 *    User details (name, email, role, userId) and login status must be accessible
 *    everywhere in the component tree — from Navbar (displaying name & role),
 *    ProtectedRoute (blocking unauthenticated access), to Pages and API callers.
 * 
 * 2. Synchronization with Persistent Storage:
 *    Keeps React's in-memory state in sync with browser `localStorage`. When the app
 *    reloads, `useEffect` reads existing credentials so the user doesn't have to log in again.
 * 
 * 3. Centralized Lifecycle Actions:
 *    `login()`, `logout()`, and `updateUser()` encapsulate all persistence, state updates,
 *    and redirection logic in one place.
 */

// 1. Create React Context with null default
export const AuthContext = createContext(null);

/**
 * AuthProvider Component:
 * Wraps the application to supply authentication state and actions.
 */
export const AuthProvider = ({ children }) => {
  // Authentication State Variables
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * ON MOUNT:
   * Hydrates auth state from localStorage.
   * Checks if token and user exist and verifies that the JWT has not expired.
   */
  useEffect(() => {
    try {
      const storedToken = getToken();
      const storedUser = getUser();

      if (storedToken && storedUser) {
        if (!isTokenExpired(storedToken)) {
          // Token is valid and unexpired
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Stale/expired token found -> purge credentials
          console.warn('[AuthContext] Stored token is expired. Clearing session.');
          clearAll();
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AuthContext] Error initializing auth state:', error);
      clearAll();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login Action:
   * Extracts token and user information from the backend AuthResponse,
   * saves them to localStorage, and updates React state.
   * 
   * Supports backend ApiResponse formats:
   * - { token, userId, name, email, role }
   * - { data: { token, userId, name, email, role } }
   * - { token, user: { ... } }
   * 
   * @param {object} authResponseData - Data received from AuthController
   */
  const login = useCallback((authResponseData) => {
    if (!authResponseData) return;

    // Normalize payload whether wrapped in .data or flat
    const payload = authResponseData.data || authResponseData;

    // 1. Extract JWT token
    const receivedToken = payload.token || payload.jwt || payload.accessToken;

    // 2. Extract User details
    const receivedUser = payload.user || {
      userId: payload.userId || payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role || 'USER',
      experienceLevel: payload.experienceLevel || 'BEGINNER',
    };

    if (receivedToken) {
      // Save token to localStorage (key: 'skillforge_token')
      saveToken(receivedToken);
      setToken(receivedToken);
    }

    if (receivedUser) {
      // Save user to localStorage (key: 'skillforge_user')
      saveUser(receivedUser);
      setUser(receivedUser);
    }

    setIsAuthenticated(true);
  }, []);

  /**
   * Logout Action:
   * Removes credentials from localStorage, resets React state,
   * and redirects user to /login.
   */
  const logout = useCallback(() => {
    // 1. Remove from localStorage
    removeToken();
    removeUser();

    // 2. Clear state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // 3. Redirect to login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }, []);

  /**
   * Update User Action:
   * Updates partial or full user properties in state and localStorage.
   * 
   * @param {object} updatedFields - New user profile fields
   */
  const updateUser = useCallback((updatedFields) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedFields };
      saveUser(newUser);
      return newUser;
    });
  }, []);

  // Context value exposed to consumers
  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to consume AuthContext conveniently.
 * Throws an error if invoked outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
