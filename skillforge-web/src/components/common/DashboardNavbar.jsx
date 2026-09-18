/**
 * ============================================================================
 * DASHBOARD NAVBAR — Top bar for authenticated pages
 * ============================================================================
 *
 * Purpose:
 *   A slim top navigation bar that sits above the page content inside
 *   DashboardLayout. It shows:
 *     - Hamburger menu button (to toggle sidebar on mobile)
 *     - Page title (optional, detected from location)
 *     - User avatar + name ? links to /profile
 *     - Quick logout button
 *
 * This navbar is DIFFERENT from the public Navbar (used on Landing/Login/Signup).
 * It is scoped to the app shell and does NOT repeat the full nav — that is the
 * sidebar's job.
 * ============================================================================
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/** Map route paths to human-readable page titles */
const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/goals':        'My Goals',
  '/tasks':        'My Tasks',
  '/ai-assistant': 'AI Mentor',
  '/profile':      'My Profile',
  '/admin':        'Admin Panel',
};

const DashboardNavbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'SkillForge';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/8"
      style={{ background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Left: mobile hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition md:hidden"
        >
          <FaBars className="text-lg" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right: notification bell + user avatar + logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Bell icon (placeholder for future notifications) */}
        <button
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition"
          title="Notifications (coming soon)"
        >
          <FaBell className="text-base" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* User avatar ? profile page */}
        <Link
          to="/profile"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/8 hover:border-primary/40 transition"
        >
          <div className="w-7 h-7 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center font-semibold text-primary text-xs">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-200">
            {user?.name?.split(' ')[0] ?? 'User'}
          </span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
        >
          <FaSignOutAlt className="text-base" />
        </button>
      </div>
    </header>
  );
};

export default DashboardNavbar;
