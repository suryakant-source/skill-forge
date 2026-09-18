/**
 * ============================================================================
 * adminApi.js - Administrative Operations REST Client for SkillForge
 * ============================================================================
 *
 * Base URL: /api/admin (via axiosInstance)
 * Authentication: Bearer JWT token automatically injected by axiosInstance
 * Authorization: Spring Security requires @PreAuthorize("hasRole('ADMIN')")
 *
 * Endpoints:
 * 1. GET /api/admin/users
 *    - Retrieves list of all registered platform users
 *    - Returns: ApiResponse<UserResponse[]>
 *
 * 2. PATCH /api/admin/users/{userId}/deactivate
 *    - Deactivates a user account (prevents login / sets isActive = false)
 *    - Returns: ApiResponse<string>
 *
 * 3. PATCH /api/admin/users/{userId}/activate
 *    - Re-activates a deactivated account (sets isActive = true)
 *    - Returns: ApiResponse<string>
 * ============================================================================
 */

import axiosInstance from './axiosInstance';

/**
 * Retrieve all registered users across the platform (Admin only).
 *
 * @returns {Promise<Array>} Resolves to array of UserResponse objects:
 *   [
 *     {
 *       id: number,
 *       name: string,
 *       email: string,
 *       bio: string,
 *       careerGoal: string,
 *       experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
 *       role: 'USER' | 'ADMIN',
 *       skills: Array<{ id: number, skillName: string }>,
 *       isActive: boolean,
 *       createdAt: string (ISO-8601)
 *     }
 *   ]
 */
export const getAllUsers = () =>
  axiosInstance.get('/admin/users');

/**
 * Deactivate a user account by ID (Admin only).
 *
 * @param {number|string} userId - ID of user to deactivate
 * @returns {Promise} Resolves to { success: true, message: string, data: string }
 */
export const deactivateUser = (userId) =>
  axiosInstance.patch(`/admin/users/${userId}/deactivate`);

/**
 * Reactivate a deactivated user account by ID (Admin only).
 *
 * @param {number|string} userId - ID of user to activate
 * @returns {Promise} Resolves to { success: true, message: string, data: string }
 */
export const activateUser = (userId) =>
  axiosInstance.patch(`/admin/users/${userId}/activate`);

const adminApi = {
  getAllUsers,
  deactivateUser,
  activateUser,
};

export default adminApi;
