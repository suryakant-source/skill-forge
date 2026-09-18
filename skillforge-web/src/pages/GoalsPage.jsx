/**
 * ============================================================================
 * GoalsPage — Full Goals CRUD Page
 * ============================================================================
 *
 * Features:
 *   - Goals grid with GoalCard components
 *   - Real-time client-side search (title + description)
 *   - Category filter pills (ALL + 8 backend enums)
 *   - Status filter (All / In Progress / Completed)
 *   - Create / Edit via GoalForm modal
 *   - Delete via DeleteConfirmModal
 *   - Empty state, loading state, error state
 *
 * Data flow:
 *   useGoals() → React Query fetches → GoalCard renders
 *   useDeleteGoal().mutateAsync() → cache invalidated → grid re-renders
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { FiPlus, FiSearch, FiTarget, FiRefreshCw } from 'react-icons/fi';
import { useGoals, useDeleteGoal } from '../hooks/useGoals';
import GoalCard from '../components/goals/GoalCard';
import GoalForm from '../components/goals/GoalForm';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

const CATEGORIES = ['ALL', 'BACKEND', 'FRONTEND', 'MOBILE', 'DATABASE', 'DEVOPS', 'AI_ML', 'DESIGN', 'OTHER'];
const STATUS_OPTIONS = ['ALL', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_LABELS  = { ALL: 'All Status', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

const GoalsPage = () => {
  // ── Modal & UI state ─────────────────────────────────────────
  const [isFormOpen, setIsFormOpen]                 = useState(false);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, goalId: null });

  // ── Filter state ─────────────────────────────────────────────
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus]     = useState('ALL');

  // ── Data ─────────────────────────────────────────────────────
  const { goals, isLoading, isError, refetch } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  // ── Client-side filtering ─────────────────────────────────────
  const filteredGoals = useMemo(() => {
    let list = Array.isArray(goals) ? goals : [];

    // Search filter (title + description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.title?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((g) => g.category?.toUpperCase() === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'COMPLETED') {
        list = list.filter((g) => g.isCompleted || g.completed);
      } else {
        list = list.filter((g) => !g.isCompleted && !g.completed);
      }
    }

    return list;
  }, [goals, searchQuery, selectedCategory, selectedStatus]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setSelectedGoalForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setSelectedGoalForEdit(goal);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (goalId) => {
    setDeleteModal({ isOpen: true, goalId });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteGoalMutation.mutateAsync(deleteModal.goalId);
    } finally {
      setDeleteModal({ isOpen: false, goalId: null });
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <FiTarget className="text-primary" />
            My Learning Goals
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Define your roadmap, track milestones, and achieve mastery.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="gradient-btn text-sm px-4 py-2.5 gap-1.5 shrink-0"
        >
          <FiPlus className="text-base" />
          Create New Goal
        </button>
      </div>

      {/* ── Filters toolbar ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search goals by title or description..."
            className="input-field text-sm pl-9"
          />
        </div>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="input-field text-sm w-auto"
          style={{ background: '#0F0F1A' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* ── Category filter pills ──────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200"
            style={selectedCategory === cat ? {
              background: 'linear-gradient(135deg, #6C63FF 0%, #3ECFCF 100%)',
              color: '#fff',
              boxShadow: '0 2px 12px rgba(108,99,255,0.35)',
            } : {
              background: 'rgba(26,26,46,0.8)',
              color: '#718096',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {cat.replace('_', '/')}
          </button>
        ))}
      </div>

      {/* ── Content area ───────────────────────────────────────── */}
      {isLoading ? (
        /* Loading skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-xl p-5 border border-white/8 animate-pulse"
              style={{ background: 'rgba(26,26,46,0.6)', height: '280px' }} />
          ))}
        </div>

      ) : isError ? (
        /* Error state */
        <div className="rounded-2xl border border-red-500/20 p-12 text-center"
          style={{ background: 'rgba(26,26,46,0.6)' }}>
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <FiTarget className="text-red-400 text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Failed to load goals</h3>
          <p className="text-gray-400 text-sm mb-5">There was an error fetching your goals from the server.</p>
          <button onClick={() => refetch()} className="gradient-btn text-sm px-4 py-2 gap-2">
            <FiRefreshCw className="text-sm" /> Try Again
          </button>
        </div>

      ) : filteredGoals.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-white/8 p-12 text-center"
          style={{ background: 'rgba(26,26,46,0.6)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }}>
            <FiTarget className="text-primary text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No goals match your filters'
              : 'No goals yet'}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
              ? 'Try adjusting your search or filter criteria.'
              : 'Start your learning journey by setting your first goal.'}
          </p>
          {!searchQuery && selectedCategory === 'ALL' && (
            <button onClick={handleOpenCreate} className="gradient-btn text-sm px-5 py-2.5 gap-1.5">
              <FiPlus /> Create Your First Goal
            </button>
          )}
        </div>

      ) : (
        /* Goals grid */
        <>
          <p className="text-xs text-gray-500 mb-4">
            Showing <span className="text-gray-300 font-medium">{filteredGoals.length}</span>{' '}
            of <span className="text-gray-300 font-medium">{goals.length}</span> goals
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Modals ─────────────────────────────────────────────── */}
      <GoalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedGoalForEdit}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, goalId: null })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteGoalMutation.isPending}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? All associated tasks will also be permanently deleted. This cannot be undone."
      />
    </div>
  );
};

export default GoalsPage;
