/**
 * ============================================================================
 * SIDEBAR COMPONENT  -  SkillForge Dashboard Navigation
 * ============================================================================
 *
 * Purpose:
 *   Renders the left-hand sidebar for all authenticated/app pages.
 *   Provides primary navigation between Dashboard, Goals, Tasks, AI Mentor,
 *   Profile, and (conditionally) Admin panel.
 *
 * Features:
 *   - Collapsible: icon-only mode on small screens / narrow state
 *   - Active link highlighting via NavLink + isActive
 *   - Role-based: Admin link only renders if user.role === 'ADMIN'
 *   - Smooth expand/collapse animation
 *   - Logout button at the bottom
 * ============================================================================
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaRocket,
  FaChartLine,
  FaBullseye,
  FaTasks,
  FaRobot,
  FaUser,
  FaShieldAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: FaChartLine,  label: 'Dashboard'   },
  { to: '/goals',        icon: FaBullseye,   label: 'Goals'       },
  { to: '/tasks',        icon: FaTasks,      label: 'Tasks'       },
  { to: '/ai-assistant', icon: FaRobot,      label: 'AI Mentor'   },
  { to: '/profile',      icon: FaUser,       label: 'Profile'     },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    [
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-primary/20 text-white border border-primary/40 shadow-sm shadow-primary/20'
        : 'text-gray-400 hover:text-white hover:bg-white/5',
    ].join(' ');

  return (
    <>
      <aside
        style={{ background: '#12122A' }}
        className={[
          'fixed top-0 left-0 h-full z-40 flex flex-col',
          'border-r border-white/10',
          'transition-all duration-300 ease-in-out',
          isOpen ? 'w-60' : 'w-16',
        ].join(' ')}
      >
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
          {isOpen && (
            <NavLink to="/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <FaRocket className="text-white text-sm" />
              </div>
              <span className="text-base font-bold tracking-tight whitespace-nowrap">
                Skill<span style={{ color: '#3ECFCF' }}>Forge</span>
              </span>
            </NavLink>
          )}
          <button
            onClick={onToggle}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className={[
              'p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition',
              !isOpen && 'mx-auto',
            ].join(' ')}
          >
            {isOpen ? <FaChevronLeft className="text-xs" /> : <FaChevronRight className="text-xs" />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={linkClass} title={!isOpen ? label : undefined}>
              <Icon className="text-base shrink-0" />
              {isOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                    : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/5',
                ].join(' ')
              }
              title={!isOpen ? 'Admin' : undefined}
            >
              <FaShieldAlt className="text-base shrink-0" />
              {isOpen && <span className="truncate">Admin</span>}
            </NavLink>
          )}
        </nav>

        {/* User + Logout footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {isOpen && (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/5 border border-white/8">
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-[10px] text-gray-400 truncate leading-tight">
                  {user?.email ?? ''}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            className={[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
              'text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition',
              !isOpen && 'justify-center',
            ].join(' ')}
          >
            <FaSignOutAlt className="text-base shrink-0" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
