/**
 * ============================================================================
 * TaskForm — Create / Edit Task Modal
 * ============================================================================
 *
 * Props:
 *   isOpen:      boolean — controls visibility
 *   onClose:     function — close callback
 *   goalId:      number|string — parent goal ID (required for create)
 *   initialData: object | null
 *     null    → Create mode (empty form, calls useCreateTask)
 *     object  → Edit mode (pre-filled, calls useUpdateTask)
 *
 * Form fields:
 *   - Title (required, min 3 chars)
 *   - Description (optional textarea)
 *   - Status dropdown (Edit mode only — matches backend enums exactly)
 *
 * On success: cache invalidated, toast shown, form reset, modal closed.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { FiX, FiList } from 'react-icons/fi';
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks';

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const STATUS_LABELS  = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

const EMPTY_FORM = {
  title:          '',
  description:    '',
  status:         'PENDING',
  estimatedHours: 2,
};

const TaskForm = ({ isOpen, onClose, goalId, initialData }) => {
  const isEditMode = Boolean(initialData);

  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // These hooks are goal-scoped → they'll invalidate goal queries on success
  const createTask = useCreateTask(goalId);
  const updateTask = useUpdateTask(goalId);

  const isPending = createTask.isPending || updateTask.isPending;

  // Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setForm({
          title:          initialData.title          || '',
          description:    initialData.description    || '',
          status:         initialData.status         || 'PENDING',
          estimatedHours: initialData.estimatedHours ?? 2,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [isOpen, initialData, isEditMode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /** Client-side validation */
  const validate = () => {
    const errs = {};
    if (!form.title || form.title.trim().length < 3)
      errs.title = 'Title must be at least 3 characters';
    if (form.estimatedHours && (form.estimatedHours < 0.5 || form.estimatedHours > 24))
      errs.estimatedHours = 'Estimated hours must be between 0.5 and 24';
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

    const payload = {
      title:          form.title.trim(),
      description:    form.description.trim(),
      estimatedHours: Number(form.estimatedHours) || 2,
      ...(isEditMode && { status: form.status }),
    };

    try {
      if (isEditMode) {
        await updateTask.mutateAsync({ taskId: initialData.id, data: payload });
      } else {
        await createTask.mutateAsync(payload);
      }
      onClose();
    } catch {
      // Error toast handled in mutation onError
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
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ background: '#1A1A2E', borderColor: 'rgba(62,207,207,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(62,207,207,0.15)', border: '1px solid rgba(62,207,207,0.35)' }}>
              <FiList className="text-secondary text-sm" style={{ color: '#3ECFCF' }} />
            </div>
            <h2 className="text-base font-bold text-white">
              {isEditMode ? 'Edit Task' : 'Add New Task'}
            </h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition">
            <FiX className="text-lg" />
          </button>
        </div>

        {/* ── Form ──────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Implement JWT authentication filter"
              className="input-field text-sm"
              autoFocus
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
              Notes / Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Notes, references, or step-by-step instructions..."
              className="input-field text-sm resize-none"
            />
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
              Estimated Hours
            </label>
            <input
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={form.estimatedHours}
              onChange={(e) => handleChange('estimatedHours', e.target.value)}
              className="input-field text-sm"
            />
            {errors.estimatedHours && (
              <p className="text-xs text-red-400 mt-1">{errors.estimatedHours}</p>
            )}
          </div>

          {/* Status — Edit mode only */}
          {isEditMode && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="input-field text-sm"
                style={{ background: '#0F0F1A' }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition">
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
                  {isEditMode ? 'Saving...' : 'Adding...'}
                </span>
              ) : isEditMode ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
