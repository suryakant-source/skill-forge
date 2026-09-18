/**
 * ============================================================================
 * DeleteConfirmModal — Reusable danger confirmation dialog
 * ============================================================================
 *
 * Props:
 *   isOpen    — boolean
 *   onClose   — function: cancel callback
 *   onConfirm — function: execute the destructive action
 *   title     — string (default: 'Delete Item')
 *   message   — string: describe what will be deleted
 *   isLoading — boolean: shows spinner on confirm button while deleting
 *
 * Accessibility:
 *   - Escape key closes modal
 *   - Focus trap (buttons receive focus on open)
 *   - Role="dialog" and aria-modal for screen reader support
 * ============================================================================
 */

import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  isLoading = false,
}) => {
  const cancelBtnRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !isLoading) onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handler);
      // Focus cancel button for keyboard accessibility
      setTimeout(() => cancelBtnRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border shadow-2xl"
        style={{ background: '#1A1A2E', borderColor: 'rgba(252,129,129,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            {/* Warning icon in danger-colored circle */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(252,129,129,0.15)', border: '1px solid rgba(252,129,129,0.4)' }}>
              <FiAlertTriangle className="text-red-400 text-lg" />
            </div>
            <h3 id="delete-modal-title" className="text-base font-bold text-white">
              {title}
            </h3>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition"
            >
              <FiX className="text-lg" />
            </button>
          )}
        </div>

        {/* Message */}
        <div className="px-5 pb-5">
          <p className="text-sm text-gray-400 leading-relaxed mb-5">{message}</p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              ref={cancelBtnRef}
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2 text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}
            >
              {isLoading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <FiAlertTriangle className="text-sm" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
