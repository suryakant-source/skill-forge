/**
 * ============================================================================
 * TaskStatusBadge — Visual status pill for task state
 * ============================================================================
 *
 * Props:
 *   status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
 *   size:   'sm' (default) | 'md'
 *
 * Each status has a distinct color:
 *   PENDING     → Yellow  — task waiting to start
 *   IN_PROGRESS → Cyan    — actively being worked on
 *   COMPLETED   → Green   — done
 *
 * Used in:
 *   - TaskCard (right side badge)
 *   - GoalDetailPage task list rows
 *   - TasksPage aggregated view
 * ============================================================================
 */

import React from 'react';
import { FiClock, FiPlayCircle, FiCheckCircle } from 'react-icons/fi';

/** Status configuration map — single source of truth for colors + labels */
const STATUS_CONFIG = {
  PENDING: {
    bg:     'rgba(236, 201, 75, 0.12)',
    text:   '#ECC94B',
    border: '1px solid rgba(236, 201, 75, 0.3)',
    Icon:   FiClock,
    label:  'Pending',
  },
  IN_PROGRESS: {
    bg:     'rgba(62, 207, 207, 0.12)',
    text:   '#3ECFCF',
    border: '1px solid rgba(62, 207, 207, 0.3)',
    Icon:   FiPlayCircle,
    label:  'In Progress',
  },
  COMPLETED: {
    bg:     'rgba(72, 187, 120, 0.12)',
    text:   '#48BB78',
    border: '1px solid rgba(72, 187, 120, 0.3)',
    Icon:   FiCheckCircle,
    label:  'Completed',
  },
};

const DEFAULT_CONFIG = STATUS_CONFIG.PENDING;

const TaskStatusBadge = ({ status, size = 'sm' }) => {
  const cfg = STATUS_CONFIG[status?.toUpperCase?.()] || DEFAULT_CONFIG;
  const { bg, text, border, Icon, label } = cfg;

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-lg whitespace-nowrap ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
      style={{ background: bg, color: text, border }}
    >
      <Icon className={isSmall ? 'text-[9px]' : 'text-[11px]'} />
      {label}
    </span>
  );
};

export default TaskStatusBadge;
