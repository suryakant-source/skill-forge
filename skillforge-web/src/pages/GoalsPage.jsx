import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBullseye, FaPlus, FaCalendarAlt, FaTrash, FaTimes } from 'react-icons/fa';
import useGoals from '../hooks/useGoals';

const CATEGORIES = ['ALL', 'FRONTEND', 'BACKEND', 'MOBILE', 'DATABASE', 'DEVOPS', 'AI_ML', 'DESIGN', 'OTHER'];

export const GoalsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'BACKEND', targetDate: '', targetHours: 40,
  });

  const { goals, isLoading, createGoal, deleteGoal, isCreating } = useGoals(
    selectedCategory === 'ALL' ? {} : { category: selectedCategory }
  );

  const filteredGoals = selectedCategory === 'ALL'
    ? goals
    : goals.filter((g) => g.category?.toUpperCase() === selectedCategory);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;
    await createGoal(formData);
    setShowModal(false);
    setFormData({ title: '', description: '', category: 'BACKEND', targetDate: '', targetHours: 40 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2.5">
            <FaBullseye className="text-primary" />
            <span>Learning Goals</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Organize, prioritize, and track your engineering milestones.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="gradient-btn text-sm px-4 py-2.5 space-x-2">
          <FaPlus />
          <span>Create New Goal</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ' +
              (selectedCategory === cat
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'bg-surface text-gray-400 hover:text-white border border-white/5')}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="glass-card p-12 text-center text-gray-400">Loading goals...</div>
      ) : filteredGoals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-2xl mx-auto mb-3">
            <FaBullseye />
          </div>
          <h3 className="text-lg font-bold text-white">No goals found</h3>
          <p className="text-gray-400 text-xs mt-1">
            {selectedCategory === 'ALL' ? 'Get started by creating your first tech goal.' : 'No goals under ' + selectedCategory + ' yet.'}
          </p>
          <button onClick={() => setShowModal(true)} className="gradient-btn text-xs px-4 py-2 mt-4">Create Goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <div key={goal.id} className="glass-card-hover p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
                    {goal.category || 'GENERAL'}
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); if (window.confirm('Delete this goal?')) deleteGoal(goal.id); }}
                    className="text-gray-500 hover:text-error text-xs p-1"
                    title="Delete Goal"
                  >
                    <FaTrash />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                <p className="text-gray-400 text-xs mt-2 line-clamp-3 leading-relaxed">{goal.description || 'No description provided.'}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-gray-400">
                  <FaCalendarAlt className="text-secondary" />
                  <span>{goal.targetDate || 'No date set'}</span>
                </div>
                <Link to={'/goals/' + goal.id} className="text-secondary font-semibold hover:underline">
                  View Tasks →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card p-6 border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Create New Goal</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Master Spring Boot Microservices"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field text-sm bg-surface"
                >
                  {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what you will achieve..."
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Target Hours</label>
                  <input
                    type="number"
                    value={formData.targetHours}
                    onChange={(e) => setFormData({ ...formData, targetHours: Number(e.target.value) })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
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
                  className="gradient-btn text-xs px-5 py-2 font-semibold disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default GoalsPage;
