/**
 * ============================================================================
 * GOAL API — SkillForge REST Client
 * ============================================================================
 * All functions use axiosInstance which:
 *   - Auto-injects Authorization: Bearer <token> header
 *   - Unwraps response.data (returns backend payload directly)
 *   - Handles 401/403/500 globally
 *
 * Backend enum values for category (must match exactly):
 *   BACKEND | FRONTEND | MOBILE | DATABASE | DEVOPS | AI_ML | DESIGN | OTHER
 * ============================================================================
 */

import axiosInstance from './axiosInstance';

/**
 * Fetch all goals for the authenticated user.
 * @param {object} params - Optional query params (e.g. { category: 'BACKEND' })
 * @returns {Promise<Goal[]>} Array of goal objects
 */
export const getAllGoals = (params) => axiosInstance.get('/goals', { params });

/**
 * Fetch a single goal by its ID.
 * @param {number|string} id - Goal ID
 * @returns {Promise<Goal>} Single goal object with full detail
 */
export const getGoalById = (id) => axiosInstance.get(`/goals/${id}`);

/**
 * Create a new goal.
 * @param {object} goalData - { title, description, category, targetDays, dailyHours }
 * @returns {Promise<Goal>} Created goal object
 */
export const createGoal = (goalData) => axiosInstance.post('/goals', goalData);

/**
 * Update an existing goal.
 * @param {number|string} id - Goal ID to update
 * @param {object} goalData - { title, description, category, targetDays, dailyHours, isCompleted }
 * @returns {Promise<Goal>} Updated goal object
 */
export const updateGoal = (id, goalData) => axiosInstance.put(`/goals/${id}`, goalData);

/**
 * Permanently delete a goal and all its associated tasks.
 * @param {number|string} id - Goal ID to delete
 * @returns {Promise<{message: string}>} Success response
 */
export const deleteGoal = (id) => axiosInstance.delete(`/goals/${id}`);

// Legacy shape-compatible object (for old useGoals that used goalApi.getGoals etc.)
const goalApi = {
  getAllGoals,
  getGoals: getAllGoals,          // alias for backward-compat
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
};

export default goalApi;
