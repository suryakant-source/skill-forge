/**
 * ============================================================================
 * DASHBOARD LAYOUT — SkillForge App Shell
 * ============================================================================
 *
 * Purpose:
 *   This is the persistent shell that wraps all protected/authenticated
 *   pages (Dashboard, Goals, Tasks, AI Mentor, Profile, Admin).
 *
 * Structure:
 *   +--------------------------------------------+
 *   ¦  SIDEBAR (fixed, left)                     ¦
 *   +--------------------------------------------¦
 *   ¦  NAVBAR (sticky, top) — inside main area   ¦
 *   ¦--------------------------------------------¦
 *   ¦  PAGE CONTENT (Outlet)                     ¦
 *   +--------------------------------------------+
 *
 * Behavior:
 *   - Sidebar starts expanded on desktop, collapsed on mobile
 *   - The main content area shifts right using margin-left = sidebar width
 *   - Transition is smooth (300ms) matching Sidebar animation duration
 * ============================================================================
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';

const DashboardLayout = () => {
  // Sidebar is open (expanded) by default on desktop; closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen" style={{ background: '#0F0F1A' }}>
      {/* Left sidebar — fixed position inside viewport */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/*
        Main content wrapper:
        - margin-left matches sidebar width so content doesn't sit under sidebar
        - Transition synced with sidebar animation (300ms)
      */}
      <div
        style={{
          marginLeft: sidebarOpen ? '240px' : '64px',
          transition: 'margin-left 300ms ease-in-out',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top navbar inside the main content area */}
        <DashboardNavbar onMenuToggle={toggleSidebar} />

        {/* Page-specific content rendered via React Router Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
