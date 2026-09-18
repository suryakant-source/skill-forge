import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

// Public and Protected Page Components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import GoalsPage from './pages/GoalsPage';
import GoalDetailPage from './pages/GoalDetailPage';
import TasksPage from './pages/TasksPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AdminPage from './pages/AdminPage';

/**
 * ============================================================================
 * SKILLFORGE APP ROOT & PROVIDER HIERARCHY
 * ============================================================================
 * 
 * Provider Hierarchy Explanation:
 * 
 * 1. <QueryClientProvider client={queryClient}> (Outermost)
 *    - Purpose: Manages server-state caching, automatic refetching, and query deduplication
 *      for all API data (goals, tasks, AI suggestions).
 *    - Why Outermost: Auth and router components can utilize React Query hooks without
 *      encountering missing query context errors.
 * 
 * 2. <AuthProvider>
 *    - Purpose: Supplies global authentication state (`user`, `token`, `isAuthenticated`, `isLoading`),
 *      as well as `login()`, `logout()`, and `updateUser()` actions across the entire component tree.
 *    - Why Inside QueryClientProvider: Allows future auth flows to interact with cached server state if needed.
 *    - Why Outside BrowserRouter: Ensures auth state is available synchronously during route evaluation.
 * 
 * 3. <BrowserRouter>
 *    - Purpose: Provides HTML5 History API routing context for URL navigation, dynamic routes,
 *      and location state tracking.
 * 
 * 4. <Toaster />
 *    - Purpose: Renders non-intrusive toast notifications (e.g. "Welcome back!", "Account created!")
 *      floating in the top-right corner.
 * 
 * 5. <Routes>
 *    - Public Routes: / (Landing), /login (Login), /signup (Signup)
 *    - Protected Routes: Guarded by <ProtectedRoute> (redirects unauthenticated users to /login)
 *    - Admin Routes: Guarded by <AdminRoute> (verifies user.role === 'ADMIN')
 *    - Catch-All Route: Redirects any unknown route back to /
 */

// 1. Initialize React Query Client with 5-minute caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Navigation Layout Component:
 * Displays the top application Navbar for authenticated app pages (/dashboard, /goals, /tasks, etc.)
 * while keeping standalone pages (Landing, Login, Signup) clean and uncluttered.
 */
const AppLayout = () => {
  const location = useLocation();

  // Public standalone pages that have their own self-contained headers
  const isStandalonePage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col selection:bg-primary/30 selection:text-white">
      {/* Show App Navbar for authenticated/app views */}
      {!isStandalonePage && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* ======================================== */}
          {/* Public Routes                            */}
          {/* ======================================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ======================================== */}
          {/* Protected Routes (Wrap with ProtectedRoute) */}
          {/* ======================================== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <GoalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals/:id"
            element={
              <ProtectedRoute>
                <GoalDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistantPage />
              </ProtectedRoute>
            }
          />
          {/* Alias redirect for legacy /ai route */}
          <Route path="/ai" element={<Navigate to="/ai-assistant" replace />} />

          {/* ======================================== */}
          {/* Admin Routes (Wrap with AdminRoute)      */}
          {/* ======================================== */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          {/* ======================================== */}
          {/* Catch-all Route                          */}
          {/* ======================================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1A1A2E',
                color: '#F7FAFC',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
              },
            }}
          />
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
