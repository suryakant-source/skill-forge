/**
 * ============================================================================
 * AdminStatsCards.jsx - High-Level Platform Health Metrics for Administrators
 * ============================================================================
 *
 * Computes and renders 4 key platform indicators from the registered users dataset:
 * 1. Total Registered Users (all records)
 * 2. Active Accounts (isActive === true)
 * 3. Deactivated Accounts (isActive === false)
 * 4. System Administrators (role === 'ADMIN')
 *
 * Design:
 * - Responsive 4-column grid (1 col mobile, 2 cols tablet, 4 cols desktop)
 * - Glassmorphism cards (#1A1A2E / dark glass styling) with subtle glowing borders
 * - 28px bold white values, distinct colored icon badges, smooth hover animations
 * ============================================================================
 */

import React from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiShield } from 'react-icons/fi';

const AdminStatsCards = ({ users = [] }) => {
  const userList = Array.isArray(users) ? users : [];

  // Metrics computation
  const totalUsers = userList.length;
  const activeUsers = userList.filter((u) => u.isActive !== false).length;
  const deactivatedUsers = userList.filter((u) => u.isActive === false).length;
  const adminCount = userList.filter((u) => u.role === 'ADMIN' || u.role?.toUpperCase() === 'ROLE_ADMIN').length;

  const cards = [
    {
      title: 'Total Users',
      value: totalUsers,
      subtitle: 'Registered accounts',
      icon: FiUsers,
      color: '#6C63FF', // Purple
      bgGradient: 'from-[#6C63FF]/20 to-[#6C63FF]/5',
      borderColor: 'rgba(108, 99, 255, 0.3)',
      iconBg: 'rgba(108, 99, 255, 0.15)',
      iconColor: '#a78bfa',
    },
    {
      title: 'Active Accounts',
      value: activeUsers,
      subtitle: 'Currently enabled',
      icon: FiUserCheck,
      color: '#10B981', // Emerald Green
      bgGradient: 'from-[#10B981]/20 to-[#10B981]/5',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#34d399',
    },
    {
      title: 'Deactivated Accounts',
      value: deactivatedUsers,
      subtitle: 'Blocked or suspended',
      icon: FiUserX,
      color: '#EF4444', // Red
      bgGradient: 'from-[#EF4444]/20 to-[#EF4444]/5',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconColor: '#f87171',
    },
    {
      title: 'Administrators',
      value: adminCount,
      subtitle: 'Full access rights',
      icon: FiShield,
      color: '#F59E0B', // Amber / Gold
      bgGradient: 'from-[#F59E0B]/20 to-[#F59E0B]/5',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#fbbf24',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            style={{
              background: '#1A1A2E',
              border: `1px solid ${card.borderColor}`,
              backdropFilter: 'blur(12px)',
            }}
            className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
          >
            {/* Ambient background glow */}
            <div
              className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.bgGradient} blur-2xl group-hover:scale-150 transition-transform duration-500`}
            />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {card.title}
              </span>
              <div
                style={{ background: card.iconBg }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-6"
              >
                <Icon style={{ color: card.iconColor }} className="text-xl" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-[28px] font-bold text-white tracking-tight leading-none mb-1">
                {card.value}
              </div>
              <p className="text-xs text-gray-400">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStatsCards;
