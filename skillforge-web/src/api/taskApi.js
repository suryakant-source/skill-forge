/**
 * ============================================================================
 * taskApi.js — Task REST Client for SkillForge
 * ============================================================================
 *
 * Backend Controller Route Summary (from TaskController.java):
 *   POST   /api/goals/{goalId}/tasks          → createTask
 *   GET    /api/goals/{goalId}/tasks          → getTasksByGoal
 *   PUT    /api/tasks/{taskId}                → updateTask (title + description)
 *   PATCH  /api/tasks/{taskId}/status         → updateTaskStatus (status enum)
 *   DELETE /api/tasks/{taskId}                → deleteTask
 *
 * IMPORTANT — ApiResponse shape:
 *   axiosInstance already unwraps response.data from Axios envelope.
 *   BUT the backend still returns: { success, message, data: T }
 *   So callers must extract `.data` from the resolved value.
 *   e.g., taskApi.getTasksByGoal(1) → { success: true, data: [...tasks] }
 *   React Query hooks handle this extraction via `select:`.
 *
 * Enums accepted by backend for status:
 *   "PENDING" | "IN_PROGRESS" | "COMPLETED"
 * ============================================================================
 */

import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/goals/{goalId}/tasks
// Returns all tasks belonging to a specific goal for the authenticated user.
// ─────────────────────────────────────────────────────────────────────────────
export const getTasksByGoal = (goalId) =>
  axiosInstance.get(`/goals/${goalId}/tasks`);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/goals/{goalId}/tasks
// Creates a new task under the specified goal.
// @param {number|string} goalId - Parent goal ID
// @param {object} taskData - { title: string, description?: string }
// ─────────────────────────────────────────────────────────────────────────────
export const createTask = (goalId, taskData) =>
  axiosInstance.post(`/goals/${goalId}/tasks`, taskData);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/tasks/{taskId}
// Updates task title and/or description.
// @param {number|string} taskId
// @param {object} taskData - { title, description }
// ─────────────────────────────────────────────────────────────────────────────
export const updateTask = (taskId, taskData) =>
  axiosInstance.put(`/tasks/${taskId}`, taskData);

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/tasks/{taskId}/status
// Updates ONLY the task status. Backend recalculates parent Goal.progress.
// @param {number|string} taskId
// @param {string} status - "PENDING" | "IN_PROGRESS" | "COMPLETED"
// ─────────────────────────────────────────────────────────────────────────────
export const updateTaskStatus = (taskId, status) =>
  axiosInstance.patch(`/tasks/${taskId}/status`, { status });

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/tasks/{taskId}
// Permanently deletes a task and triggers goal progress recalculation.
// @param {number|string} taskId
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTask = (taskId) =>
  axiosInstance.delete(`/tasks/${taskId}`);

// ─────────────────────────────────────────────────────────────────────────────
// Default export object (for backward-compatibility with any code using
// `import taskApi from '../api/taskApi'` and `taskApi.createTask(...)`)
// ─────────────────────────────────────────────────────────────────────────────
const taskApi = {
  getTasksByGoal,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  // Legacy aliases used by old useTasks.js (keep for safety)
  getTasks: (params) => axiosInstance.get('/tasks', { params }),
  getTaskById: (id) => axiosInstance.get(`/tasks/${id}`),
};

export default taskApi;
