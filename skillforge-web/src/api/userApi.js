/**
 * ============================================================================
 * userApi.js - User Profile & Skills REST Client for SkillForge
 * ============================================================================
 *
 * Backend routes (UserController.java — /api/users):
 *   GET    /api/users/profile          -> getProfile()
 *   PUT    /api/users/profile          -> updateProfile(profileData)
 *   POST   /api/users/skills           -> addSkill(skillName)
 *   DELETE /api/users/skills/{skillId} -> removeSkill(skillId)
 *
 * ApiResponse shape (backend wraps everything):
 *   { success: boolean, message: string, data: T }
 *   axiosInstance interceptor strips the Axios envelope, so callers get
 *   the ApiResponse object directly: { success, message, data }
 *   React Query hooks extract `.data` via `select:`.
 *
 * UserResponse shape (data field):
 *   {
 *     id, name, email, bio, careerGoal, experienceLevel, role,
 *     skills: [{ id, skillName }, ...],   <- SkillResponse objects with IDs!
 *     isActive, createdAt
 *   }
 * ============================================================================
 */

import axiosInstance from './axiosInstance';

// ----------------------------------------------------------------------------
// GET /api/users/profile
// Returns the full profile of the currently authenticated user,
// including their skills list with IDs for deletion support.
// ----------------------------------------------------------------------------
export const getProfile = () =>
  axiosInstance.get('/users/profile');

// ----------------------------------------------------------------------------
// PUT /api/users/profile
// Updates mutable profile fields. Does NOT change password or email.
// @param {object} profileData - { name, bio, careerGoal, experienceLevel }
//   - name:             string (2-50 chars, required)
//   - bio:              string (optional, max 500 chars)
//   - careerGoal:       string (optional, max 200 chars)
//   - experienceLevel:  'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
// @returns UserResponse with updated fields
// ----------------------------------------------------------------------------
export const updateProfile = (profileData) =>
  axiosInstance.put('/users/profile', profileData);

// ----------------------------------------------------------------------------
// POST /api/users/skills
// Adds a new skill to the user's profile.
// Backend rejects duplicates with a 400 BadRequestException.
// @param {string} skillName - e.g., "Java", "Spring Boot", "Docker"
// @returns Updated UserResponse with the new skill appended to skills[]
// ----------------------------------------------------------------------------
export const addSkill = (skillName) =>
  axiosInstance.post('/users/skills', { skillName });

// ----------------------------------------------------------------------------
// DELETE /api/users/skills/{skillId}
// Permanently removes a skill by its database row ID.
// @param {number} skillId - The UserSkill entity ID (from SkillResponse.id)
// @returns ApiResponse<String> with success message
// ----------------------------------------------------------------------------
export const removeSkill = (skillId) =>
  axiosInstance.delete(`/users/skills/${skillId}`);

// Default export for backward-compat with any code using `import userApi from './userApi'`
const userApi = {
  getProfile,
  updateProfile,
  addSkill,
  removeSkill,
};

export default userApi;
