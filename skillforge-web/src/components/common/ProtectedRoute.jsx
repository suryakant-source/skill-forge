import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';
import toast from 'react-hot-toast';

/**
 * ============================================================================
 * SKILLFORGE ROUTE PROTECTION COMPONENTS
 * ============================================================================
 * 
 * Why Protected Routes Are Needed:
 * 1. Security & Access Control:
 *    Single Page Applications (SPAs) run entirely on the client side. While
 *    backend endpoints validate JWT tokens for every API request, frontend route
 *    protection prevents unauthorized users from viewing private UI views,
 *    sensitive user metrics, goals, tasks, or admin configuration panels.
 * 
 * 2. User Experience & Smooth Navigation:
 *    When an unauthenticated user tries to visit a protected page (e.g., /dashboard),
 *    instead of showing a broken page or half-loaded data, we gracefully capture
 *    their intended destination (location state) and redirect them to /login.
 *    Once logged in, they can immediately be redirected back to where they intended to go.
 * 
 * 3. Prevention of Race Conditions:
 *    During app initialization, auth state is restored asynchronously from
 *    localStorage. While `isLoading` is true, rendering a Loader prevents premature
 *    redirects to /login before the token validation is complete.
 */

/**
 * ProtectedRoute Component:
 * Guards routes that require a logged-in user.
 * 
 * - If auth is still initializing (`isLoading === true`), displays the `<Loader />`.
 * - If user is unauthenticated, redirects to `/login` while preserving origin in `state.from`.
 * - If authenticated, renders either passed `children` or the nested `<Outlet />`.
 */
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // 1. While reading token/user from storage, show full-screen loader
  if (isLoading) {
    return <Loader message="Verifying authentication session..." />;
  }

  // 2. If user is not logged in, redirect to login page and save previous location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Optional role check (for backward compatibility if passed to ProtectedRoute)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Render children if provided, otherwise render nested Route Outlet
  return children ? children : <Outlet />;
};

/**
 * AdminRoute Component:
 * Guards routes exclusively reserved for users with the 'ADMIN' role.
 * 
 * - Ensures user is authenticated first.
 * - Confirms `user.role === 'ADMIN'`.
 * - If not admin, redirects to the standard user `/dashboard`.
 * - If admin, renders either passed `children` or nested `<Outlet />`.
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // 1. Wait for auth state to finish loading
  if (isLoading) {
    return <Loader message="Checking administrator privileges..." />;
  }

  // 2. Must be authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Must possess the ADMIN role
  const isAdmin = user?.role === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN';
  if (!isAdmin) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Authorized administrator access granted
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
