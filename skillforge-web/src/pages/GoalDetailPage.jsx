/**
 * ============================================================================
 * GoalDetailPage — Goal Hero + Full Task Management
 * ============================================================================
 *
 * This page is the execution center for a learning goal. It displays:
 *   1. Goal hero banner: title, description, category, progress bar
 *   2. Quick stat cards: total / pending / completed / in-progress
 *   3. Filter tabs: All | Pending | In Progress | Completed
 *   4. Task list using TaskCard with status toggle, edit, delete
 *   5. Add Task & Edit Task modals (TaskForm)
 *   6. Delete task confirmation (DeleteConfirmModal)
 *   7. Delete goal confirmation (DeleteConfirmModal → navigates away)
 *
 * REAL-TIME PROGRESS SYNC:
 * ────────────────────────
 * When a task's status changes to COMPLETED, useUpdateTaskStatus() invalidates:
 *   ['tasks', goalId]        → task list re-fetches (checkbox turns green)
 *   ['goal', goalId]         → this page's progress bar re-animates
 *   ['goals']                → GoalsPage card progress bar re-animates
 *   ['dashboard']            → Dashboard stat card updates
 * Backend computes: progress = (completedCount / totalCount) * 100
 *
 * QUERY KEY SYNC:
 * useGoalDetail uses queryKey ['goal', id] (string, from useParams)
 * useGoalTasks  uses queryKey ['tasks', id] (string, from useParams)
 * Invalidation covers both String & Number variants for safety.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiPlus,
  FiClock, FiCalendar, FiCheckCircle, FiList,
  FiTarget, FiPlayCircle,
} from 'react-icons/fi';
import { useGoalDetail, useDeleteGoal } from '../hooks/useGoals';
import { useGoalTasks, useUpdateTaskStatus, useDeleteTask } from '../hooks/useTasks';
import GoalForm from '../components/goals/GoalForm';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

// ─────────────────────────────────────────────────────────────────────────────
// Category color map (matches GoalCard)
// ─────────────────────────────────────────────────────────────────────────────
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
      style={{ background: `${color}22`, border: `1px solid ${color}55` }}>
      <Icon style={{ color }} className="text-base" />
    </div>
    <div>
      <p className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-white leading-none mt-0.5">{value}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'ALL',         label: 'All Tasks',   Icon: FiList },
  { key: 'PENDING',     label: 'Pending',     Icon: FiClock },
  { key: 'IN_PROGRESS', label: 'In Progress', Icon: FiPlayCircle },
  { key: 'COMPLETED',   label: 'Completed',   Icon: FiCheckCircle },
];

const GoalDetailPage = () => {
  const { id } = useParams();          // id is always a string from URL
  const navigate = useNavigate();

  // ── Data hooks ─────────────────────────────────────────────
  const { data: goal, isLoading: goalLoading }      = useGoalDetail(id);
  const { data: tasks = [], isLoading: tasksLoading } = useGoalTasks(id);

  // Goal-scoped mutation hooks
  const statusMutation = useUpdateTaskStatus(id);
  const deleteMutation  = useDeleteTask(id);
  const deleteGoalMutation = useDeleteGoal();

  // ── UI state ───────────────────────────────────────────────
  const [activeTab, setActiveTab]           = useState('ALL');
  const [isGoalEditOpen, setIsGoalEditOpen] = useState(false);
  const [deleteGoalOpen, setDeleteGoalOpen] = useState(false);

  // Task form modal: create or edit
  const [taskFormState, setTaskFormState] = useState({ open: false, task: null });
  // Task delete confirm
  const [deleteTaskState, setDeleteTaskState] = useState({ open: false, taskId: null });

  // ── Derived values ─────────────────────────────────────────
  const taskList      = Array.isArray(tasks) ? tasks : [];
  const totalCount    = taskList.length;
  const completedCount = taskList.filter((t) => t.status === 'COMPLETED').length;
  const inProgressCount = taskList.filter((t) => t.status === 'IN_PROGRESS').length;
  const pendingCount  = taskList.filter((t) => t.status === 'PENDING').length;
  const progress      = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const cat   = goal?.category?.toUpperCase() || 'OTHER';
  const color = CATEGORY_COLORS[cat] || DEFAULT_COLOR;

  // Tab count badges
  const TAB_COUNTS = {
    ALL:         totalCount,
    PENDING:     pendingCount,
    IN_PROGRESS: inProgressCount,
    COMPLETED:   completedCount,
  };

  // Filtered task list based on active tab
  const filteredTasks = useMemo(() => {
    if (activeTab === 'ALL') return taskList;
    return taskList.filter((t) => t.status === activeTab);
  }, [taskList, activeTab]);

  // ── Handlers ───────────────────────────────────────────────
  const handleStatusChange = (taskId, status) => {
    statusMutation.mutate({ taskId, status });
  };

  const handleEditTask = (task) => {
    setTaskFormState({ open: true, task });
  };

  const handleDeleteTaskOpen = (taskId) => {
    setDeleteTaskState({ open: true, taskId });
  };

  const handleDeleteTaskConfirm = async () => {
    await deleteMutation.mutateAsync(deleteTaskState.taskId);
    setDeleteTaskState({ open: false, taskId: null });
  };

  const handleDeleteGoalConfirm = async () => {
    await deleteGoalMutation.mutateAsync(id);
    navigate('/goals');
  };

  // ── Loading state ──────────────────────────────────────────
  if (goalLoading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-5 w-28 rounded-lg bg-white/5" />
        <div className="rounded-2xl h-60 bg-white/5 border border-white/8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-white/5 border border-white/8" />)}
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <FiTarget className="text-gray-600 text-5xl mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Goal not found</h2>
        <p className="text-gray-400 text-sm mb-6">This goal may have been deleted.</p>
        <Link to="/goals" className="gradient-btn text-sm px-4 py-2">← Back to Goals</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <Link to="/goals"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition">
        <FiArrowLeft /> Back to Goals
      </Link>

      {/* ── Goal Hero Banner ───────────────────────────────────── */}
      <div className="rounded-2xl p-6 sm:p-8 border"
        style={{ background: 'rgba(26,26,46,0.85)', borderColor: color.border,
          boxShadow: `0 0 40px ${color.bg}` }}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges row */}
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

            {/* Target days + daily hours */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {goal.targetDays && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <FiClock style={{ color: color.text }} />{goal.targetDays} day target
                </span>
              )}
              {goal.dailyHours && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <FiCalendar style={{ color: '#3ECFCF' }} />{goal.dailyHours} hrs/day
                </span>
              )}
            </div>
          </div>

          {/* Edit / Delete buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setIsGoalEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition">
              <FiEdit2 /> Edit Goal
            </button>
            <button onClick={() => setDeleteGoalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 transition">
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>

        {/* ── Progress Bar ──────────────────────────────────────── */}
        <div className="mt-6 pt-6 border-t border-white/8">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-500">Goal Progress</span>
            <span className="font-bold" style={{ color: color.text }}>
              {progress}% &mdash; {completedCount}/{totalCount} tasks completed
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            {/* Animated progress bar — width recalculates after query invalidation */}
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${color.text} 0%, #3ECFCF 100%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Quick Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={FiList}         label="Total"       value={totalCount}     color="#6C63FF" />
        <StatCard icon={FiClock}        label="Pending"     value={pendingCount}   color="#ECC94B" />
        <StatCard icon={FiPlayCircle}   label="In Progress" value={inProgressCount} color="#3ECFCF" />
        <StatCard icon={FiCheckCircle}  label="Completed"   value={completedCount} color="#48BB78" />
      </div>

      {/* ── Tasks Section ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/8 overflow-hidden"
        style={{ background: 'rgba(26,26,46,0.6)' }}>

        {/* ── Section Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FiList className="text-primary" style={{ color: '#6C63FF' }} />
            Goal Tasks & Roadmap
            <span className="text-xs text-gray-500 font-normal">({totalCount})</span>
          </h2>
          <button
            onClick={() => setTaskFormState({ open: true, task: null })}
            className="gradient-btn text-xs px-3.5 py-2 gap-1.5"
          >
            <FiPlus /> Add New Task
          </button>
        </div>

        {/* ── Filter Tabs ────────────────────────────────────── */}
        <div className="flex border-b border-white/8 overflow-x-auto">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            const count    = TAB_COUNTS[key];
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
                style={isActive ? { color: '#6C63FF', borderBottomColor: '#6C63FF' } : {}}
              >
                <Icon className="text-[11px]" />
                {label}
                <span
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                  style={isActive
                    ? { background: 'rgba(108,99,255,0.2)', color: '#6C63FF' }
                    : { background: 'rgba(255,255,255,0.07)', color: '#718096' }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Task List ──────────────────────────────────────── */}
        <div className="p-4">
          {tasksLoading ? (
            /* Skeleton loader */
            <div className="space-y-2.5">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 rounded-xl border border-white/8 animate-pulse"
                  style={{ background: 'rgba(26,26,46,0.6)' }} />
              ))}
            </div>

          ) : filteredTasks.length === 0 ? (
            /* Empty state */
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)' }}>
                {activeTab === 'COMPLETED'
                  ? <FiCheckCircle className="text-green-400 text-2xl" />
                  : <FiList className="text-primary text-2xl" style={{ color: '#6C63FF' }} />
                }
              </div>
              <p className="text-gray-300 font-semibold text-sm">
                {activeTab === 'ALL'
                  ? 'No tasks yet for this goal'
                  : `No ${activeTab.toLowerCase().replace('_', ' ')} tasks`}
              </p>
              <p className="text-gray-500 text-xs mt-1 mb-5">
                {activeTab === 'ALL'
                  ? 'Break this goal into smaller, actionable steps to track your progress.'
                  : 'Switch to another tab or add new tasks.'}
              </p>
              {activeTab === 'ALL' && (
                <button
                  onClick={() => setTaskFormState({ open: true, task: null })}
                  className="gradient-btn text-xs px-4 py-2 gap-1.5"
                >
                  <FiPlus /> Add Your First Task
                </button>
              )}
            </div>

          ) : (
            /* Task cards */
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTaskOpen}
                  isChangingStatus={statusMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}

      {/* Task Create / Edit modal */}
      <TaskForm
        isOpen={taskFormState.open}
        onClose={() => setTaskFormState({ open: false, task: null })}
        goalId={id}
        initialData={taskFormState.task}
      />

      {/* Task delete confirmation */}
      <DeleteConfirmModal
        isOpen={deleteTaskState.open}
        onClose={() => setDeleteTaskState({ open: false, taskId: null })}
        onConfirm={handleDeleteTaskConfirm}
        isLoading={deleteMutation.isPending}
        title="Delete Task"
        message="Are you sure you want to delete this task? Goal progress will be recalculated. This cannot be undone."
      />

      {/* Goal edit modal */}
      <GoalForm
        isOpen={isGoalEditOpen}
        onClose={() => setIsGoalEditOpen(false)}
        initialData={goal}
      />

      {/* Goal delete confirmation */}
      <DeleteConfirmModal
        isOpen={deleteGoalOpen}
        onClose={() => setDeleteGoalOpen(false)}
        onConfirm={handleDeleteGoalConfirm}
        isLoading={deleteGoalMutation.isPending}
        title="Delete Goal"
        message="This will permanently delete this goal AND all its tasks. This action cannot be undone."
      />
    </div>
  );
};

export default GoalDetailPage;
