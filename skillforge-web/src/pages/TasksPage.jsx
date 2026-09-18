/**
 * ============================================================================
 * TasksPage.jsx - Global Task Board (Kanban Columns)
 * ============================================================================
 *
 * Displays all tasks categorized across 3 workflow columns:
 *   [ PENDING ] -> [ IN_PROGRESS ] -> [ COMPLETED ]
 *
 * Features:
 *   - Goal filter selector: "All Goals" or filter by individual goal
 *   - Status transitions with quick action buttons
 *   - Create task modal with goal selector
 *   - Edit & delete task capabilities
 *   - Responsive 3-column layout with glassmorphism cards
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import {
  FiCheckSquare, FiPlus, FiClock, FiPlayCircle,
  FiCheckCircle, FiTrash2, FiEdit2, FiFilter,
} from 'react-icons/fi';
import useGoals from '../hooks/useGoals';
import {
  useAllTasks,
  useGoalTasks,
  useCreateTask,
  useUpdateTaskStatus,
  useDeleteTask,
} from '../hooks/useTasks';
import TaskForm from '../components/tasks/TaskForm';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import TaskStatusBadge from '../components/tasks/TaskStatusBadge';

const TasksPage = () => {
  const { goals = [], isLoading: goalsLoading } = useGoals();
  const [selectedGoalId, setSelectedGoalId] = useState('ALL');

  // Fetch tasks
  const allTasksQuery = useAllTasks(goals);
  const singleGoalQuery = useGoalTasks(selectedGoalId === 'ALL' ? null : selectedGoalId);

  const isAll = selectedGoalId === 'ALL';
  const tasks = isAll ? (allTasksQuery.data || []) : (singleGoalQuery.data || []);
  const isLoading = goalsLoading || (isAll ? allTasksQuery.isLoading : singleGoalQuery.isLoading);

  // Mutations
  const createTaskMutation = useCreateTask(selectedGoalId === 'ALL' ? null : selectedGoalId);
  const statusMutation = useUpdateTaskStatus(selectedGoalId === 'ALL' ? null : selectedGoalId);
  const deleteMutation = useDeleteTask(selectedGoalId === 'ALL' ? null : selectedGoalId);

  // Modals state
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  // Filtered lists
  const pendingTasks = useMemo(() => tasks.filter((t) => t.status === 'PENDING'), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter((t) => t.status === 'IN_PROGRESS'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'COMPLETED'), [tasks]);

  const handleStatusChange = (taskId, newStatus, goalId) => {
    statusMutation.mutate({ taskId, status: newStatus, goalId });
  };

  const handleDeleteConfirm = async () => {
    if (deleteTaskId) {
      await deleteMutation.mutateAsync(deleteTaskId);
      setDeleteTaskId(null);
    }
  };

  const renderTaskCard = (task) => {
    const isCompleted = task.status === 'COMPLETED';

    return (
      <div
        key={task.id}
        className="p-4 rounded-xl border transition-all duration-200 group"
        style={{
          background: 'rgba(26,26,46,0.85)',
          borderColor: isCompleted ? 'rgba(72,187,120,0.25)' : 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {task.goalTitle && (
              <span
                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1.5"
                style={{
                  background: 'rgba(108,99,255,0.12)',
                  color: '#6C63FF',
                  border: '1px solid rgba(108,99,255,0.25)',
                }}
              >
                {task.goalTitle}
              </span>
            )}
            <h4
              className={`text-sm font-semibold leading-snug ${
                isCompleted ? 'line-through text-gray-500' : 'text-white'
              }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setEditingTask(task);
                setTaskFormOpen(true);
              }}
              className="p-1 rounded text-gray-400 hover:text-primary transition"
              title="Edit"
            >
              <FiEdit2 className="text-xs" />
            </button>
            <button
              onClick={() => setDeleteTaskId(task.id)}
              className="p-1 rounded text-gray-400 hover:text-red-400 transition"
              title="Delete"
            >
              <FiTrash2 className="text-xs" />
            </button>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.status !== 'PENDING' && (
              <button
                onClick={() => handleStatusChange(task.id, 'PENDING', task.goalId)}
                className="px-2 py-0.5 rounded text-[10px] font-medium text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 transition"
              >
                Mark Pending
              </button>
            )}
            {task.status !== 'IN_PROGRESS' && (
              <button
                onClick={() => handleStatusChange(task.id, 'IN_PROGRESS', task.goalId)}
                className="px-2 py-0.5 rounded text-[10px] font-medium text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 transition"
              >
                In Progress
              </button>
            )}
            {task.status !== 'COMPLETED' && (
              <button
                onClick={() => handleStatusChange(task.id, 'COMPLETED', task.goalId)}
                className="px-2 py-0.5 rounded text-[10px] font-medium text-green-400 bg-green-400/10 hover:bg-green-400/20 transition"
              >
                Complete
              </button>
            )}
          </div>
          <TaskStatusBadge status={task.status} size="sm" />
        </div>
      </div>
    );
  };

  const renderColumn = (title, items, count, Icon, color, borderColor) => (
    <div
      className="flex flex-col rounded-2xl border p-4 min-h-[500px]"
      style={{
        background: 'rgba(26,26,46,0.6)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}44` }}
          >
            <Icon style={{ color }} className="text-xs" />
          </div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color }}
        >
          {count}
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-gray-500">No tasks in {title.toLowerCase()}</p>
          </div>
        ) : (
          items.map(renderTaskCard)
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <FiCheckSquare className="text-primary" />
            <span>Task Board</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track daily progress and move tasks across execution stages.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Goal Selector */}
          <div className="flex items-center gap-2 bg-surface/90 border border-white/10 rounded-xl px-3 py-1.5">
            <FiFilter className="text-gray-400 text-xs" />
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#1A1A2E] text-white">
                All Goals ({goals.length})
              </option>
              {goals.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#1A1A2E] text-white">
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setTaskFormOpen(true);
            }}
            disabled={goals.length === 0}
            className="gradient-btn text-xs sm:text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50"
          >
            <FiPlus />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-white/5 border border-white/8" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderColumn('Pending', pendingTasks, pendingTasks.length, FiClock, '#ECC94B')}
          {renderColumn('In Progress', inProgressTasks, inProgressTasks.length, FiPlayCircle, '#3ECFCF')}
          {renderColumn('Completed', completedTasks, completedTasks.length, FiCheckCircle, '#48BB78')}
        </div>
      )}

      {/* Task Form Modal */}
      {taskFormOpen && (
        <TaskForm
          isOpen={taskFormOpen}
          onClose={() => {
            setTaskFormOpen(false);
            setEditingTask(null);
          }}
          goalId={editingTask?.goalId || (selectedGoalId !== 'ALL' ? selectedGoalId : goals[0]?.id)}
          initialData={editingTask}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTaskId)}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? Goal progress will be recalculated automatically."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default TasksPage;
