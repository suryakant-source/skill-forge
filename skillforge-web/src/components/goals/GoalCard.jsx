/**
 * ============================================================================
 * GoalCard — Individual goal card for the goals grid
 * ============================================================================
 *
 * Props:
 *   goal    - Goal object from API
 *   onEdit  - Callback(goal) — opens GoalForm in edit mode
 *   onDelete - Callback(goalId) — opens DeleteConfirmModal
 *
 * Category → color mapping keeps cards visually distinct.
 * Progress bar is animated on mount via CSS transition.
 * ============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiEdit2, FiTrash2, FiClock, FiCalendar,
  FiCheckCircle, FiList, FiTarget,
} from 'react-icons/fi';

/** Category badge color map */
const CATEGORY_COLORS = {
  BACKEND:   { bg: 'rgba(108,99,255,0.15)', border: 'rgba(108,99,255,0.4)', text: '#6C63FF' },
  FRONTEND:  { bg: 'rgba(62,207,207,0.15)', border: 'rgba(62,207,207,0.4)', text: '#3ECFCF' },
  MOBILE:    { bg: 'rgba(236,201,75,0.15)', border: 'rgba(236,201,75,0.4)', text: '#ECC94B' },
  DATABASE:  { bg: 'rgba(72,187,120,0.15)', border: 'rgba(72,187,120,0.4)', text: '#48BB78' },
  DEVOPS:    { bg: 'rgba(237,137,54,0.15)', border: 'rgba(237,137,54,0.4)', text: '#ED8936' },
  AI_ML:     { bg: 'rgba(159,122,234,0.15)', border: 'rgba(159,122,234,0.4)', text: '#9F7AEA' },
  DESIGN:    { bg: 'rgba(237,100,166,0.15)', border: 'rgba(237,100,166,0.4)', text: '#ED64A6' },
  OTHER:     { bg: 'rgba(160,174,192,0.15)', border: 'rgba(160,174,192,0.4)', text: '#A0AEC0' },
};

const DEFAULT_COLOR = { bg: 'rgba(108,99,255,0.15)', border: 'rgba(108,99,255,0.4)', text: '#6C63FF' };

const GoalCard = ({ goal, onEdit, onDelete }) => {
  const cat = goal.category?.toUpperCase() || 'OTHER';
  const color = CATEGORY_COLORS[cat] || DEFAULT_COLOR;

  // Compute progress from completedTaskCount / taskCount
  const total = goal.taskCount ?? 0;
  const done  = goal.completedTaskCount ?? 0;
  // Backend may provide explicit progress field
  const progress = goal.progress ?? (total > 0 ? Math.round((done / total) * 100) : 0);

  const isCompleted = goal.isCompleted || goal.completed || false;

  return (
    <div
      className="flex flex-col rounded-xl p-5 border transition-all duration-200 group"
      style={{
        background: 'rgba(26,26,46,0.8)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color.border;
        e.currentTarget.style.boxShadow = `0 8px 30px ${color.bg}`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category badge */}
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide"
            style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}
          >
            {cat}
          </span>

          {/* Status badge */}
          {isCompleted ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(72,187,120,0.15)', color: '#48BB78', border: '1px solid rgba(72,187,120,0.4)' }}>
              <FiCheckCircle className="text-[10px]" /> Completed
            </span>
          ) : (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(236,201,75,0.1)', color: '#ECC94B', border: '1px solid rgba(236,201,75,0.3)' }}>
              In Progress
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
            title="Edit goal"
          >
            <FiEdit2 className="text-sm" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Delete goal"
          >
            <FiTrash2 className="text-sm" />
          </button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex-1">
        <h3 className="text-base font-bold text-white leading-snug line-clamp-2 mb-1">
          {goal.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {goal.description || 'No description provided.'}
        </p>
      </div>

      {/* ── Meta row ─────────────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-500">
        {goal.targetDays && (
          <span className="flex items-center gap-1">
            <FiClock style={{ color: color.text }} />
            {goal.targetDays} days
          </span>
        )}
        {goal.dailyHours && (
          <span className="flex items-center gap-1">
            <FiCalendar style={{ color: '#3ECFCF' }} />
            {goal.dailyHours} hrs/day
          </span>
        )}
        {total > 0 && (
          <span className="flex items-center gap-1">
            <FiList style={{ color: '#ECC94B' }} />
            {done}/{total} tasks
          </span>
        )}
      </div>

      {/* ── Progress bar ──────────────────────────────────────── */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-gray-500">Progress</span>
          <span className="text-[11px] font-bold" style={{ color: color.text }}>{progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${color.text}, #3ECFCF)`,
            }}
          />
        </div>
      </div>

      {/* ── Footer CTA ────────────────────────────────────────── */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[11px] text-gray-500 flex items-center gap-1">
          <FiTarget className="text-[10px]" />
          {total > 0 ? `${done}/${total} tasks done` : 'No tasks yet'}
        </span>
        <Link
          to={`/goals/${goal.id}`}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}
        >
          View Tasks →
        </Link>
      </div>
    </div>
  );
};

export default GoalCard;
