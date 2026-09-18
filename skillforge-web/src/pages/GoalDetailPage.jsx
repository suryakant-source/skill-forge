import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaPlus, FaCheckCircle, FaTrash, FaTimes } from 'react-icons/fa';
import { useGoalDetail } from '../hooks/useGoals';
import { useGoalTasks, useTasks } from '../hooks/useTasks';

export const GoalDetailPage = () => {
  const { id } = useParams();
  const { data: goalRes, isLoading: goalLoading } = useGoalDetail(id);
  const { data: tasksRes, isLoading: tasksLoading } = useGoalTasks(id);
  const { createTask, updateStatus, deleteTask, isCreating } = useTasks();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', estimatedHours: 2, goalId: id });

  const goal = goalRes?.data || goalRes;
  const tasks = tasksRes?.data || tasksRes || [];

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const percent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title) return;
    await createTask({ ...taskForm, goalId: id });
    setShowTaskModal(false);
    setTaskForm({ title: '', description: '', estimatedHours: 2, goalId: id });
  };

  if (goalLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">Loading goal details...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/goals" className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white mb-6">
        <FaArrowLeft />
        <span>Back to Goals</span>
      </Link>

      <div className="glass-card p-6 sm:p-8 border border-white/10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
              {goal?.category || 'GENERAL'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3">{goal?.title || 'Goal Details'}</h1>
            <p className="text-gray-400 text-sm mt-2 max-w-2xl">{goal?.description || 'No description provided.'}</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-300 bg-surface px-4 py-2 rounded-lg border border-white/5">
            <FaCalendarAlt className="text-secondary" />
            <span>Target: {goal?.targetDate || 'Flexible'}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Milestone Progress</span>
            <span className="font-bold text-secondary">{percent}% Completed ({completedCount}/{tasks.length})</span>
          </div>
          <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
              style={{ width: percent + '%' }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Actionable Tasks</h2>
        <button onClick={() => setShowTaskModal(true)} className="gradient-btn text-xs px-3.5 py-2 space-x-1.5">
          <FaPlus />
          <span>Add Task</span>
        </button>
      </div>

      {tasksLoading ? (
        <div className="glass-card p-8 text-center text-gray-400 text-sm">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-300 font-medium">No tasks yet for this goal!</p>
          <p className="text-gray-400 text-xs mt-1">Break this goal down into smaller, actionable steps.</p>
          <button onClick={() => setShowTaskModal(true)} className="gradient-btn text-xs px-4 py-2 mt-4">
            Add First Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="glass-card p-4 border border-white/10 flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() =>
                    updateStatus({
                      id: task.id,
                      status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
                    })
                  }
                  className={'mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition ' +
                    (task.status === 'COMPLETED'
                      ? 'bg-success border-success text-white'
                      : 'border-gray-500 hover:border-success')
                  }
                >
                  {task.status === 'COMPLETED' && <FaCheckCircle className="text-xs" />}
                </button>
                <div>
                  <h4 className={'text-sm font-semibold ' + (task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-white')}>
                    {task.title}
                  </h4>
                  {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={'text-[10px] px-2 py-0.5 rounded font-semibold uppercase ' +
                    (task.status === 'COMPLETED'
                      ? 'bg-success/20 text-success'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-warning/20 text-warning')
                  }
                >
                  {task.status}
                </span>
                <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-error text-xs p-1">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card p-6 border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Add Task to Goal</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Complete Spring Data JPA practice"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Additional instructions..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Estimated Hours</label>
                <input
                  type="number"
                  value={taskForm.estimatedHours}
                  onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: Number(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="gradient-btn text-xs px-4 py-2 font-semibold disabled:opacity-50"
                >
                  {isCreating ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default GoalDetailPage;
