/**
 * ============================================================================
 * AdminPage.jsx - Platform Administration & User Directory Dashboard
 * ============================================================================
 *
 * Core Capabilities:
 * 1. Security & RBAC:
 *    - Role protected: Only accounts with role === 'ADMIN' can access
 *    - Security fallback screen if accessed directly by an unauthorized user
 * 2. High-Level Metrics:
 *    - AdminStatsCards: Total users, Active accounts, Inactive accounts, Admin count
 * 3. Live Directory & User Controls:
 *    - UserTable with full-text search, role filters, status filters
 *    - Safe account deactivation / activation flow with confirmation dialog
 *    - Prevents self-deactivation of current logged-in admin
 * ============================================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiLock, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useAdminUsers, useDeactivateUser, useActivateUser } from '../hooks/useAdmin';
import AdminStatsCards from '../components/admin/AdminStatsCards';
import UserTable from '../components/admin/UserTable';
import Loader from '../components/common/Loader';

export const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: users = [], isLoading, isError, error, refetch } = useAdminUsers();
  const deactivateMutation = useDeactivateUser();
  const activateMutation = useActivateUser();

  // Confirmation Modal State for Deactivation / Activation
  const [modalState, setModalState] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    isDeactivating: true, // true: Deactivate, false: Activate
  });

  // Check if current user is an Admin
  const isAdmin = user?.role === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN';

  // ── Security Fallback View (if non-admin reaches this view) ─────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div
          style={{
            background: '#1A1A2E',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            backdropFilter: 'blur(16px)',
          }}
          className="max-w-md w-full rounded-2xl p-8 text-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
            <FiLock className="text-red-400 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            You do not have administrative privileges to view this console. This security event has been logged.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Loading View ────────────────────────────────────────────────────────────
  if (isLoading) {
    return <Loader message="Loading platform users & system telemetry..." />;
  }

  // ── Handle Action Modal Trigger ─────────────────────────────────────────────
  const handleOpenConfirm = (userId, isCurrentlyActive, userName) => {
    setModalState({
      isOpen: true,
      userId,
      userName: userName || 'User',
      isDeactivating: isCurrentlyActive, // if active, action is to deactivate
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      userId: null,
      userName: '',
      isDeactivating: true,
    });
  };

  const handleConfirmAction = async () => {
    if (!modalState.userId) return;

    if (modalState.isDeactivating) {
      await deactivateMutation.mutateAsync(modalState.userId);
    } else {
      await activateMutation.mutateAsync(modalState.userId);
    }
    handleCloseModal();
  };

  const isMutating = deactivateMutation.isPending || activateMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Platform Administration
            </h1>
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#fbbf24',
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
            >
              <FiShield className="text-xs" />
              🔒 Role Protected (Admin Only)
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Manage system users, access control, and review platform engagement
          </p>
        </div>

        {/* Live Admin Profile Pill */}
        <div
          style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          className="flex items-center gap-3 px-4 py-2 rounded-2xl self-start md:self-auto"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user?.name}</p>
            <p className="text-[11px] text-amber-400 font-medium leading-tight">Super Administrator</p>
          </div>
        </div>
      </div>

      {/* ── Error Banner (if fetch failed) ─────────────────────────────────── */}
      {isError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="text-base shrink-0 text-red-400" />
            <span>Failed to load platform users: {error?.message || 'Unknown error'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-white transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Metric Stat Cards ──────────────────────────────────────────────── */}
      <AdminStatsCards users={users} />

      {/* ── User Directory Table ───────────────────────────────────────────── */}
      <UserTable
        users={users}
        onToggleStatus={handleOpenConfirm}
        currentAdminEmail={user?.email}
      />

      {/* ── Action Confirmation Modal (Deactivate / Activate) ───────────────── */}
      {modalState.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget && !isMutating) handleCloseModal(); }}
        >
          <div
            style={{
              background: '#1A1A2E',
              border: `1px solid ${modalState.isDeactivating ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            }}
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {!isMutating && (
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white transition"
              >
                <FiX className="text-lg" />
              </button>
            )}

            {/* Modal Icon + Title */}
            <div className="flex items-center gap-3 mb-4">
              <div
                style={{
                  background: modalState.isDeactivating ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${modalState.isDeactivating ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                }}
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              >
                {modalState.isDeactivating ? (
                  <FiAlertTriangle className="text-red-400 text-xl" />
                ) : (
                  <FiCheckCircle className="text-emerald-400 text-xl" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalState.isDeactivating ? 'Deactivate User Account' : 'Reactivate User Account'}
                </h3>
                <p className="text-xs text-gray-400">Confirmation Required</p>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              {modalState.isDeactivating ? (
                <>
                  Are you sure you want to deactivate <strong className="text-white">{modalState.userName}</strong>?
                  This user will be immediately logged out and prevented from accessing SkillForge until an administrator restores access.
                </>
              ) : (
                <>
                  Are you sure you want to reactivate <strong className="text-white">{modalState.userName}</strong>?
                  This user will regain full platform access with their existing profile and credentials.
                </>
              )}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={isMutating}
                className="px-4 py-2 text-sm rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isMutating}
                style={{
                  background: modalState.isDeactivating
                    ? 'rgba(239, 68, 68, 0.9)'
                    : 'rgba(16, 185, 129, 0.9)',
                }}
                className="px-5 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {isMutating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  modalState.isDeactivating ? 'Deactivate Account' : 'Activate Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
