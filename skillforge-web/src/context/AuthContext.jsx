import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, getUser, setUser, clearAuth } from '../utils/tokenHelper';
import authApi from '../api/authApi';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => getUser());
  const [token, setTokenState] = useState(() => getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const res = await authApi.getCurrentUser();
          const userData = res.data || res;
          setUser(userData);
          setUserState(userData);
        } catch (error) {
          console.warn('Failed to restore session:', error.message);
          clearAuth();
          setUserState(null);
          setTokenState(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      const data = res.data || res;
      const receivedToken = data.token || data.jwt || data.accessToken;
      const receivedUser = data.user || {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || 'USER',
        experienceLevel: data.experienceLevel,
      };

      if (receivedToken) {
        setToken(receivedToken);
        setTokenState(receivedToken);
      }
      if (receivedUser) {
        setUser(receivedUser);
        setUserState(receivedUser);
      }

      toast.success(`Welcome back, ${receivedUser.name || 'Learner'}!`);
      return { success: true, user: receivedUser };
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const res = await authApi.signup(userData);
      const data = res.data || res;
      toast.success('Account created successfully! Please log in.');
      return { success: true, data };
    } catch (error) {
      toast.error(error.message || 'Signup failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      setUserState(null);
      setTokenState(null);
      toast.success('Logged out successfully.');
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
