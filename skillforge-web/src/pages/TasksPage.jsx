import React, { useState } from 'react';
import { FaTasks, FaPlus, FaCheckCircle, FaTrash, FaTimes } from 'react-icons/fa';
import useTasks from '../hooks/useTasks';
import useGoals from '../hooks/useGoals';

export const TasksPage = () => {
  const { tasks, isLoading, createTask, updateStatus, deleteTask, isCreating } = useTasks();
  const { goals } = useGoals();

  const [showModal, setShowModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    estimatedHours: 2,
    goalId: '',
  });

  const pendingList = tasks.filter((t) => t.status === 'PENDING');
  const inProgressList = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedList = tasks.filter((t) => t.status === 'COMPLETED');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!taskForm.title) return;
    await createTask(taskForm);
    setShowModal(false);
    setTaskForm({ title: '', description: '', estimatedHours: 2, goalId: '' });
  };

  const renderColumn = (title, items, statusColor, targetStatus) => (
    <div className="glass-card p-4 border border-white/10 flex flex-col h-full min-h-[450px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <span className={'w-2 h-2 rounded-full ' + statusColor} />
          <span>{title}</span>
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-gray-300 font-semibold border border-white/5">
          {items.length}
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">No tasks</p>
        ) : (
          items.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-lg bg-surface/90 border border-white/5 hover:border-primary/40 transition flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                {task.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  {task.status !== 'PENDING' && (
                    <button
                      onClick={() => updateStatus({ id: task.id, status: 'PENDING' })}
                      className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300 hover:bg-white/10"
                    >
                      Pending
                    </button>
                  )}
                  {task.status !== 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateStatus({ id: task.id, status: 'IN_PROGRESS' })}
                      className="px-2 py-0.5 rounded bg-secondary/20 text-[10px] text-secondary hover:bg-secondary/30"
                    >
                      In Progress
                    </button>
                  )}
                  {task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => updateStatus({ id: task.id, status: 'COMPLETED' })}
                      className="px-2 py-0.5 rounded bg-success/20 text-[10px] text-success hover:bg-success/30"
                    >
                      Complete
                    </button>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-500 hover:text-error p-1"
                >
                  <FaTrash className="text-[11px]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2.5">
            <FaTasks className="text-warning" />
            <span>Task Board</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Organize daily tasks across Pending, In Progress, and Completed states.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="gradient-btn text-sm px-4 py-2.5 space-x-2"
        >
          <FaPlus />
          <span>New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn('Pending', pendingList, 'bg-warning', 'PENDING')}
        {renderColumn('In Progress', inProgressList, 'bg-secondary', 'IN_PROGRESS')}
        {renderColumn('Completed', completedList, 'bg-success', 'COMPLETED')}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card p-6 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Create New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Implement JwtAuthFilter"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Associated Goal (Optional)</label>
                <select
                  value={taskForm.goalId}
                  onChange={(e) => setTaskForm({ ...taskForm, goalId: e.target.value })}
                  className="input-field text-sm bg-surface"
                >
                  <option value="">-- Independent Task --</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Task breakdown or notes..."
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="gradient-btn text-xs px-4 py-2 font-semibold disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TasksPage;
