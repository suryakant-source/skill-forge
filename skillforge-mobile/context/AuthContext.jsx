import React, { createContext, useContext, useState, useEffect } from 'react';
import tokenHelper from '../utils/tokenHelper';

/**
 * ============================================================================
 * SkillForge Mobile - Authentication Context
 * ============================================================================
 * Manages global user authentication state across all mobile screens:
 * - Restores persisted session from SecureStore on startup
 * - Provides login, logout, and user update actions
 * - Exposes isAuthenticated and isLoading for route guarding
 * ============================================================================
 */

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on mount
  useEffect(() => {
    async function initializeAuth() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          tokenHelper.getToken(),
          tokenHelper.getUser(),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('[AuthContext] Session restore failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  const login = async (userData, authToken) => {
    try {
      await Promise.all([
        tokenHelper.saveToken(authToken),
        tokenHelper.saveUser(userData),
      ]);
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('[AuthContext] Login save error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await tokenHelper.clearAll();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('[AuthContext] Logout clear error:', error);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const mergedUser = { ...user, ...updatedData };
      await tokenHelper.saveUser(mergedUser);
      setUser(mergedUser);
    } catch (error) {
      console.error('[AuthContext] Update user error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
