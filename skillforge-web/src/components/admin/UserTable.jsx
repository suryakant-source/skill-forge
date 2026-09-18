/**
 * ============================================================================
 * UserTable.jsx - Comprehensive Platform User Directory & Access Control
 * ============================================================================
 *
 * Provides a responsive management table for platform administrators with:
 * - Real-time full-text search across user name and email
 * - Role filter tab pills (All, Users, Admins)
 * - Status filter dropdown (All, Active, Inactive)
 * - Self-deactivation protection (disabled 'Current User' badge for logged-in admin)
 * - Account activation / deactivation triggers invoking parent modal handler
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import {
  FiSearch,
  FiShield,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiCalendar,
} from 'react-icons/fi';

const UserTable = ({
  users = [],
  onToggleStatus,
  currentAdminEmail = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'USER' | 'ADMIN'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Filtered dataset computation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search filter
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term);

      // 2. Role filter
      const uRole = (u.role || 'USER').toUpperCase();
      const matchesRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'ADMIN' && (uRole === 'ADMIN' || uRole === 'ROLE_ADMIN')) ||
        (roleFilter === 'USER' && uRole === 'USER');

      // 3. Status filter
      const isActive = u.isActive !== false;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && isActive) ||
        (statusFilter === 'INACTIVE' && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Format creation timestamp
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div
      style={{
        background: '#1A1A2E',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
      }}
      className="rounded-2xl p-6 shadow-xl"
    >
      {/* ── Search & Filter Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters: Role + Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Role pills */}
          <div
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            className="p-1 rounded-xl flex items-center gap-1 border border-white/10"
          >
            {[
              { key: 'ALL', label: 'All Roles' },
              { key: 'USER', label: 'Users' },
              { key: 'ADMIN', label: 'Admins' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  roleFilter === key
                    ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'text-gray-400 hover:text-white',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              className="px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-primary transition cursor-pointer appearance-none pr-8"
            >
              <option value="ALL" className="bg-[#1A1A2E] text-white">All Status</option>
              <option value="ACTIVE" className="bg-[#1A1A2E] text-white">Active Accounts</option>
              <option value="INACTIVE" className="bg-[#1A1A2E] text-white">Inactive Accounts</option>
            </select>
            <FiFilter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Table Container ────────────────────────────────────────────────── */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="pb-3.5 pl-2">User</th>
              <th className="pb-3.5">Email</th>
              <th className="pb-3.5">Role</th>
              <th className="pb-3.5">Experience</th>
              <th className="pb-3.5">Skills</th>
              <th className="pb-3.5">Status</th>
              <th className="pb-3.5">Joined</th>
              <th className="pb-3.5 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-gray-400">
                  <FiSearch className="text-3xl mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No users match the search criteria</p>
                  <p className="text-xs text-gray-500 mt-1">Try resetting the filters or search term</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isCurrentAdmin =
                  currentAdminEmail &&
                  user.email?.toLowerCase() === currentAdminEmail.toLowerCase();
                const isActive = user.isActive !== false;
                const isAdmin =
                  user.role === 'ADMIN' || user.role?.toUpperCase() === 'ROLE_ADMIN';
                const skillsList = Array.isArray(user.skills) ? user.skills : [];

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* 1. User avatar + name */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            background: isAdmin
                              ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                              : 'linear-gradient(135deg, #6C63FF, #3ECFCF)',
                          }}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                        >
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-[150px]">
                            {user.name}
                          </p>
                          {isCurrentAdmin && (
                            <span className="text-[10px] text-yellow-400 font-medium">
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Email */}
                    <td className="py-3.5 text-gray-300 font-mono text-xs truncate max-w-[180px]">
                      {user.email}
                    </td>

                    {/* 3. Role badge */}
                    <td className="py-3.5">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          <FiShield className="text-xs" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          <FiUser className="text-xs" />
                          USER
                        </span>
                      )}
                    </td>

                    {/* 4. Experience */}
                    <td className="py-3.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                        {user.experienceLevel || 'BEGINNER'}
                      </span>
                    </td>

                    {/* 5. Skills preview */}
                    <td className="py-3.5">
                      {skillsList.length === 0 ? (
                        <span className="text-xs text-gray-500">None</span>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap max-w-[160px]">
                          {skillsList.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10 truncate max-w-[70px]"
                            >
                              {s.skillName || s}
                            </span>
                          ))}
                          {skillsList.length > 2 && (
                            <span className="text-[10px] text-gray-400">
                              +{skillsList.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 6. Status */}
                    <td className="py-3.5">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* 7. Joined Date */}
                    <td className="py-3.5 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="text-[11px] text-gray-500" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>

                    {/* 8. Action buttons */}
                    <td className="py-3.5 text-right pr-2">
                      {isCurrentAdmin ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed">
                          Current User
                        </span>
                      ) : isActive ? (
                        <button
                          onClick={() => onToggleStatus(user.id, true, user.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/30 border border-rose-500/30 hover:border-rose-500/60 transition shadow-sm"
                          title="Deactivate account"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleStatus(user.id, false, user.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/60 transition shadow-sm"
                          title="Activate account"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table Footer Summary ────────────────────────────────────────────── */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
        <span>
          Showing <strong className="text-white">{filteredUsers.length}</strong> of{' '}
          <strong className="text-white">{users.length}</strong> users
        </span>
        <span className="text-[11px] text-gray-500">
          * Admin users cannot deactivate their own active account session
        </span>
      </div>
    </div>
  );
};

export default UserTable;
