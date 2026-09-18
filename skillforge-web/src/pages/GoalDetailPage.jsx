/**
 * ============================================================================
 * GoalDetailPage — Single Goal Detail + Task Management
 * ============================================================================
 *
 * Data coordination:
 *   useGoalDetail(id) → goal hero + meta info
 *   useGoalTasks(id)  → goal-scoped task list
 *   useTasks()        → createTask / updateStatus / deleteTask actions
 *
 * The page acts as a container that:
 *   1. Displays goal's full profile at the top (hero banner)
 *   2. Shows quick stats (total / completed / pending tasks)
 *   3. Lists each task with checkbox toggle, status badge, and delete
 *   4. Provides inline Add Task modal for fast task creation
 * ============================================================================
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiPlus, FiClock,
  FiCalendar, FiCheckCircle, FiList, FiTarget, FiX,
} from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import { useGoalDetail, useDeleteGoal } from '../hooks/useGoals';
import { useGoalTasks, useTasks } from '../hooks/useTasks';
import GoalForm from '../components/goals/GoalForm';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

const CATEGORY_COLORS = {
  BACKEND:  { bg: 'rgba(108,99,255,0.15)', border: 'rgba(108,99,255,0.4)', text: '#6C63FF' },
  FRONTEND: { bg: 'rgba(62,207,207,0.15)', border: 'rgba(62,207,207,0.4)', text: '#3ECFCF' },
  MOBILE:   { bg: 'rgba(236,201,75,0.15)', border: 'rgba(236,201,75,0.4)', text: '#ECC94B' },
  DATABASE: { bg: 'rgba(72,187,120,0.15)', border: 'rgba(72,187,120,0.4)', text: '#48BB78' },
  DEVOPS:   { bg: 'rgba(237,137,54,0.15)', border: 'rgba(237,137,54,0.4)', text: '#ED8936' },
  AI_ML:    { bg: 'rgba(159,122,234,0.15)', border: 'rgba(159,122,234,0.4)', text: '#9F7AEA' },
  DESIGN:   { bg: 'rgba(237,100,166,0.15)', border: 'rgba(237,100,166,0.4)', text: '#ED64A6' },
  OTHER:    { bg: 'rgba(160,174,192,0.15)', border: 'rgba(160,174,192,0.4)', text: '#A0AEC0' },
};
const DEFAULT_COLOR = CATEGORY_COLORS.BACKEND;

/** Small stat card */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-xl p-4 border border-white/8 flex items-center gap-3"
    style={{ background: 'rgba(26,26,46,0.7)' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: color + '22', border: `1px solid ${color}66` }}>
      <Icon style={{ color }} className="text-base" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const GoalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: goal, isLoading: goalLoading }   = useGoalDetail(id);
  const { data: tasksData, isLoading: tasksLoading } = useGoalTasks(id);
  const { createTask, updateStatus, deleteTask, isCreating } = useTasks();
  const deleteGoalMutation = useDeleteGoal();

  // Normalize task list
  const tasks = Array.isArray(tasksData)
    ? tasksData
    : Array.isArray(tasksData?.data)
    ? tasksData.data
    : [];

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingCount   = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const percent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const cat   = goal?.category?.toUpperCase() || 'OTHER';
  const color = CATEGORY_COLORS[cat] || DEFAULT_COLOR;

  // ── Modal state ───────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteGoalModal, setDeleteGoalModal] = useState(false);
  const [showTaskModal, setShowTaskModal]     = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', estimatedHours: 2 });

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    await createTask({ ...taskForm, goalId: id });
    setShowTaskModal(false);
    setTaskForm({ title: '', description: '', estimatedHours: 2 });
  };

  const handleConfirmDeleteGoal = async () => {
    await deleteGoalMutation.mutateAsync(id);
    navigate('/goals');
  };

  if (goalLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 rounded-lg bg-white/5" />
          <div className="rounded-2xl h-56 bg-white/5 border border-white/8" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-white/5 border border-white/8" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <FiTarget className="text-gray-600 text-5xl mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Goal not found</h2>
        <p className="text-gray-400 text-sm mb-6">This goal may have been deleted or the ID is incorrect.</p>
        <Link to="/goals" className="gradient-btn text-sm px-4 py-2">← Back to Goals</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Back navigation ────────────────────────────────────── */}
      <Link to="/goals"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition">
        <FiArrowLeft /> Back to Goals
      </Link>

      {/* ── Hero Banner ────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 sm:p-8 border"
        style={{ background: 'rgba(26,26,46,0.8)', borderColor: color.border }}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide"
                style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}>
                {cat}
              </span>
              {(goal.isCompleted || goal.completed) ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(72,187,120,0.15)', color: '#48BB78', border: '1px solid rgba(72,187,120,0.4)' }}>
                  <FiCheckCircle className="text-[10px]" /> Completed
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(236,201,75,0.1)', color: '#ECC94B', border: '1px solid rgba(236,201,75,0.3)' }}>
                  In Progress
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
              {goal.title}
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              {goal.description || 'No description provided.'}
            </p>

            {/* Meta badges */}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              {goal.targetDays && (
                <span className="flex items-center gap-1.5">
                  <FiClock style={{ color: color.text }} />{goal.targetDays} days target
                </span>
              )}
              {goal.dailyHours && (
                <span className="flex items-center gap-1.5">
                  <FiCalendar style={{ color: '#3ECFCF' }} />{goal.dailyHours} hrs/day
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white transition border border-white/10 hover:border-primary/40 hover:bg-primary/5"
            >
              <FiEdit2 /> Edit
            </button>
            <button
              onClick={() => setDeleteGoalModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-red-400 transition border border-white/10 hover:border-red-500/30 hover:bg-red-500/5"
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-6 border-t border-white/8">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-500">Overall Progress</span>
            <span className="font-bold" style={{ color: color.text }}>
              {percent}% ({completedCount}/{tasks.length} tasks)
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${color.text}, #3ECFCF)` }}
            />
          </div>
        </div>
      </div>

      {/* ── Quick Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={FiList}         label="Total Tasks"     value={tasks.length}    color="#6C63FF" />
        <StatCard icon={FiCheckCircle}  label="Completed"       value={completedCount}  color="#48BB78" />
        <StatCard icon={FiTarget}       label="Pending"         value={pendingCount}    color="#ECC94B" />
      </div>

      {/* ── Tasks section ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Goal Tasks & Roadmap</h2>
          <button onClick={() => setShowTaskModal(true)} className="gradient-btn text-xs px-3.5 py-2 gap-1.5">
            <FiPlus /> Add Task
          </button>
        </div>

        {tasksLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-xl h-16 border border-white/8 animate-pulse"
                style={{ background: 'rgba(26,26,46,0.6)' }} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-white/8 p-10 text-center"
            style={{ background: 'rgba(26,26,46,0.6)' }}>
            <FiList className="text-gray-600 text-4xl mx-auto mb-3" />
            <p className="text-gray-300 font-medium">No tasks yet for this goal!</p>
            <p className="text-gray-500 text-xs mt-1 mb-5">Break this goal into smaller, actionable steps.</p>
            <button onClick={() => setShowTaskModal(true)} className="gradient-btn text-xs px-4 py-2 gap-1.5">
              <FiPlus /> Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div key={task.id}
                className="rounded-xl px-4 py-3 border border-white/8 flex items-center justify-between gap-3 transition hover:border-white/15"
                style={{ background: 'rgba(26,26,46,0.7)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  {/* Toggle checkbox */}
                  <button
                    onClick={() => updateStatus({
                      id: task.id,
                      status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
                    })}
                    className="w-5 h-5 rounded border flex items-center justify-center shrink-0 transition"
                    style={task.status === 'COMPLETED'
                      ? { background: '#48BB78', borderColor: '#48BB78' }
                      : { borderColor: '#4A5568' }}
                  >
                    {task.status === 'COMPLETED' && <FaCheckCircle className="text-white text-xs" />}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-white'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-500 truncate">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                    style={
                      task.status === 'COMPLETED'
                        ? { background: 'rgba(72,187,120,0.15)', color: '#48BB78' }
                        : task.status === 'IN_PROGRESS'
                        ? { background: 'rgba(62,207,207,0.15)', color: '#3ECFCF' }
                        : { background: 'rgba(236,201,75,0.1)', color: '#ECC94B' }
                    }
                  >
                    {task.status?.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Task Modal ─────────────────────────────────────── */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowTaskModal(false); }}>
          <div className="w-full max-w-md rounded-2xl border shadow-2xl"
            style={{ background: '#1A1A2E', borderColor: 'rgba(108,99,255,0.3)' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
              <h3 className="text-base font-bold text-white">Add Task to Goal</h3>
              <button onClick={() => setShowTaskModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition">
                <FiX className="text-lg" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Task Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Complete Spring Data JPA exercises"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">Description</label>
                <textarea rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Additional notes..."
                  className="input-field text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">Estimated Hours</label>
                <input type="number" min={1} max={24}
                  value={taskForm.estimatedHours}
                  onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: Number(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating}
                  className="gradient-btn text-sm px-4 py-2 disabled:opacity-50">
                  {isCreating ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Goal Modal ────────────────────────────────────── */}
      <GoalForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={goal}
      />

      {/* ── Delete Goal Confirm ────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={deleteGoalModal}
        onClose={() => setDeleteGoalModal(false)}
        onConfirm={handleConfirmDeleteGoal}
        isLoading={deleteGoalMutation.isPending}
        title="Delete Goal"
        message="This will permanently delete this goal and ALL of its tasks. This action cannot be undone."
      />
    </div>
  );
};

export default GoalDetailPage;
