import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FaRocket,
  FaTasks,
  FaBullseye,
  FaRobot,
  FaUser,
  FaShieldAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
} from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-white bg-primary/20 border border-primary/40'
        : 'text-gray-300 hover:text-white hover:bg-surface'
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-card !rounded-none border-x-0 border-t-0 border-b border-white/10 bg-surface/80 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <FaRocket className="text-white text-lg" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Skill<span className="text-secondary">Forge</span>
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            <NavLink to="/dashboard" className={navLinkClasses}>
              <FaChartLine />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/goals" className={navLinkClasses}>
              <FaBullseye />
              <span>Goals</span>
            </NavLink>
            <NavLink to="/tasks" className={navLinkClasses}>
              <FaTasks />
              <span>Tasks</span>
            </NavLink>
            <NavLink to="/ai" className={navLinkClasses}>
              <FaRobot className="text-secondary" />
              <span>AI Mentor</span>
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={navLinkClasses}>
                <FaShieldAlt className="text-warning" />
                <span>Admin</span>
              </NavLink>
            )}
          </div>
        ) : null}

        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface border border-white/10 hover:border-primary/50 text-sm transition"
              >
                <div className="w-7 h-7 rounded-full bg-primary/30 text-primary flex items-center justify-center font-semibold text-xs border border-primary/40">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-gray-200 font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition"
                title="Logout"
              >
                <FaSignOutAlt className="text-lg" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link to="/signup" className="gradient-btn text-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-white rounded-lg focus:outline-none"
          >
            {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/10 flex flex-col space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-surface"
              >
                <FaChartLine />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/goals"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-surface"
              >
                <FaBullseye />
                <span>Goals</span>
              </Link>
              <Link
                to="/tasks"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-surface"
              >
                <FaTasks />
                <span>Tasks</span>
              </Link>
              <Link
                to="/ai"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-surface"
              >
                <FaRobot className="text-secondary" />
                <span>AI Mentor</span>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-surface"
                >
                  <FaShieldAlt className="text-warning" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-surface"
              >
                <FaUser />
                <span>Profile ({user?.name})</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-error hover:bg-error/10 w-full text-left"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-center text-sm font-medium text-gray-300 hover:bg-surface rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="gradient-btn text-center text-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
