/**
 * ============================================================================
 * TaskCard — Individual task row card
 * ============================================================================
 *
 * Props:
 *   task:           { id, title, description, status, estimatedHours }
 *   onStatusChange: (taskId, newStatus) => void
 *   onEdit:         (task) => void
 *   onDelete:       (taskId) => void
 *   isChangingStatus: boolean — shows spinner on status buttons while API runs
 *
 * STATUS CYCLE via quick toggle buttons:
 *   PENDING → IN_PROGRESS → COMPLETED → PENDING (cycle)
 *
 * Checkbox behavior (left icon):
 *   - COMPLETED  → green filled checkbox icon (click → toggle back to PENDING)
 *   - Others     → empty circle (click → mark COMPLETED directly)
 *
 * Title style:
 *   - COMPLETED → line-through, gray text
 *   - Others    → white bold text
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  FiEdit2, FiTrash2, FiClock, FiPlayCircle, FiCheckCircle,
} from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import TaskStatusBadge from './TaskStatusBadge';

/** Next status in the cycle: PENDING → IN_PROGRESS → COMPLETED → PENDING */
const NEXT_STATUS = {
  PENDING:     'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED:   'PENDING',
};

/** Quick status action button labels */
const STATUS_ACTIONS = {
  PENDING:     { label: 'Start',    Icon: FiPlayCircle,   color: '#3ECFCF' },
  IN_PROGRESS: { label: 'Complete', Icon: FiCheckCircle,  color: '#48BB78' },
  COMPLETED:   { label: 'Revert',   Icon: FiClock,        color: '#ECC94B' },
};

const TaskCard = ({ task, onStatusChange, onEdit, onDelete, isChangingStatus }) => {
  const [hovered, setHovered] = useState(false);
  const isCompleted = task.status === 'COMPLETED';
  const action = STATUS_ACTIONS[task.status] || STATUS_ACTIONS.PENDING;

  const handleCheckboxClick = () => {
    // Checkbox: toggle between COMPLETED and PENDING
    const newStatus = isCompleted ? 'PENDING' : 'COMPLETED';
    onStatusChange(task.id, newStatus);
  };

  const handleCycleStatus = () => {
    const newStatus = NEXT_STATUS[task.status] || 'IN_PROGRESS';
    onStatusChange(task.id, newStatus);
  };

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-200"
      style={{
        background: hovered ? 'rgba(26,26,46,0.95)' : 'rgba(26,26,46,0.75)',
        borderColor: hovered ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)',
        boxShadow: hovered ? '0 4px 20px rgba(108,99,255,0.08)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Left: Checkbox toggle ────────────────────────────── */}
      <button
        onClick={handleCheckboxClick}
        disabled={isChangingStatus}
        className="mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-all disabled:opacity-50"
        style={isCompleted
          ? { background: '#48BB78', borderColor: '#48BB78' }
          : { borderColor: '#4A5568', background: 'transparent' }
        }
        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
      >
        {isCompleted && <FaCheckCircle className="text-white text-[11px]" />}
      </button>

      {/* ── Center: Title + Description ──────────────────────── */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-snug ${
            isCompleted ? 'line-through text-gray-500' : 'text-white'
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}
        {/* Estimated hours chip */}
        {task.estimatedHours && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-600 mt-1.5">
            <FiClock className="text-[9px]" />
            {task.estimatedHours}h estimated
          </span>
        )}
      </div>

      {/* ── Right: Actions ────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Current status badge */}
        <TaskStatusBadge status={task.status} />

        {/* Quick cycle button — cycles status forward */}
        <button
          onClick={handleCycleStatus}
          disabled={isChangingStatus}
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition disabled:opacity-50"
          style={{
            background: `${action.color}18`,
            color: action.color,
            border: `1px solid ${action.color}44`,
          }}
          title={`Mark as ${NEXT_STATUS[task.status]}`}
        >
          <action.Icon className="text-[9px]" />
          {action.label}
        </button>

        {/* Edit icon */}
        <button
          onClick={() => onEdit(task)}
          className={`p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition ${
            hovered ? 'opacity-100' : 'opacity-0 sm:opacity-100'
          }`}
          title="Edit task"
        >
          <FiEdit2 className="text-xs" />
        </button>

        {/* Delete icon */}
        <button
          onClick={() => onDelete(task.id)}
          className={`p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition ${
            hovered ? 'opacity-100' : 'opacity-0 sm:opacity-100'
          }`}
          title="Delete task"
        >
          <FiTrash2 className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
