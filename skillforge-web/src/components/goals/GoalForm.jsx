/**
 * ============================================================================
 * GoalForm — Create / Edit Goal Modal
 * ============================================================================
 *
 * Props:
 *   isOpen      — boolean: controls modal visibility
 *   onClose     — function: close modal callback
 *   initialData — object | null:
 *                 null  → Create mode (empty form)
 *                 goal  → Edit mode (pre-filled form)
 *
 * Mode detection: `initialData !== null` means Edit mode.
 * The same component handles both flows to avoid duplication.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { FiX, FiTarget } from 'react-icons/fi';
import { useCreateGoal, useUpdateGoal } from '../../hooks/useGoals';

const CATEGORIES = ['BACKEND', 'FRONTEND', 'MOBILE', 'DATABASE', 'DEVOPS', 'AI_ML', 'DESIGN', 'OTHER'];

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'BACKEND',
  targetDays: 30,
  dailyHours: 2,
  isCompleted: false,
};

const GoalForm = ({ isOpen, onClose, initialData }) => {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();

  const isPending = createGoalMutation.isPending || updateGoalMutation.isPending;

  // When switching between create/edit or re-opening, sync form state
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setForm({
          title:       initialData.title       || '',
          description: initialData.description || '',
          category:    initialData.category    || 'BACKEND',
          targetDays:  initialData.targetDays  ?? 30,
          dailyHours:  initialData.dailyHours  ?? 2,
          isCompleted: initialData.isCompleted || initialData.completed || false,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [isOpen, initialData, isEditMode]);

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  /** Inline validation */
  const validate = () => {
    const errs = {};
    if (!form.title || form.title.trim().length < 3)
      errs.title = 'Title must be at least 3 characters';
    if (!form.targetDays || form.targetDays < 1)
      errs.targetDays = 'Target days must be at least 1';
    if (!form.dailyHours || form.dailyHours < 1 || form.dailyHours > 24)
      errs.dailyHours = 'Daily hours must be between 1 and 24';
    return errs;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      if (isEditMode) {
        await updateGoalMutation.mutateAsync({ id: initialData.id, data: form });
      } else {
        await createGoalMutation.mutateAsync(form);
      }
      onClose();
    } catch {
      // Error toast is handled inside the mutation onError
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl relative"
        style={{ background: '#1A1A2E', borderColor: 'rgba(108,99,255,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)' }}>
              <FiTarget className="text-primary text-sm" />
            </div>
            <h2 className="text-base font-bold text-white">
              {isEditMode ? 'Edit Goal' : 'Create New Goal'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition">
            <FiX className="text-lg" />
          </button>
        </div>

        {/* ── Form Body ────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
              Goal Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Master Spring Boot 3 & Microservices"
              className="input-field text-sm"
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What do you want to achieve with this goal?"
              className="input-field text-sm resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="input-field text-sm"
              style={{ background: '#0F0F1A' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace('_', '/')}</option>
              ))}
            </select>
          </div>

          {/* Target Days + Daily Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
                Target Days <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={form.targetDays}
                onChange={(e) => handleChange('targetDays', Number(e.target.value))}
                placeholder="30"
                className="input-field text-sm"
              />
              {errors.targetDays && <p className="text-xs text-red-400 mt-1">{errors.targetDays}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
                Daily Hours <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={form.dailyHours}
                onChange={(e) => handleChange('dailyHours', Number(e.target.value))}
                placeholder="2"
                className="input-field text-sm"
              />
              {errors.dailyHours && <p className="text-xs text-red-400 mt-1">{errors.dailyHours}</p>}
            </div>
          </div>

          {/* Mark as completed — Edit mode only */}
          {isEditMode && (
            <label className="flex items-center gap-3 p-3 rounded-xl border border-white/8 cursor-pointer hover:bg-white/4 transition">
              <input
                type="checkbox"
                checked={form.isCompleted}
                onChange={(e) => handleChange('isCompleted', e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-gray-300">Mark this goal as completed</span>
            </label>
          )}

          {/* ── Footer Buttons ────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="gradient-btn text-sm px-5 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </span>
              ) : isEditMode ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
