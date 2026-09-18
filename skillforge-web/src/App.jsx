import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';

// Layout shells
import DashboardLayout from './components/common/DashboardLayout';

// Public page imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Protected page imports (rendered inside DashboardLayout)
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import GoalsPage from './pages/GoalsPage';
import GoalDetailPage from './pages/GoalDetailPage';
import TasksPage from './pages/TasksPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AdminPage from './pages/AdminPage';

/**
 * ============================================================================
 * PROVIDER HIERARCHY
 * ============================================================================
 * QueryClientProvider  (server-state caching)
 *   AuthProvider       (global auth state  -  outside BrowserRouter so routes
 *                       can read auth synchronously during first render)
 *     BrowserRouter    (HTML5 History API routing)
 *       Toaster        (toast notifications, top-right)
 *       Routes         (page-level route declarations)
 * ============================================================================
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

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

          <Routes>
            {/* -- Public Routes ---------------------------------------- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* -- Protected Routes (wrapped in DashboardLayout) -------
                All routes nested here will:
                  1. Be guarded by ProtectedRoute (redirect to /login if not auth)
                  2. Rendered inside DashboardLayout (Sidebar + DashboardNavbar + Outlet)
            */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/goals/:id" element={<GoalDetailPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Admin route  -  additional role check inside AdminRoute */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
            </Route>

            {/* Legacy alias */}
            <Route path="/ai" element={<Navigate to="/ai-assistant" replace />} />

            {/* Catch-all ? home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
