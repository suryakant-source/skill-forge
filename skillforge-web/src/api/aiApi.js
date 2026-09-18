/**
 * ============================================================================
 * aiApi.js - Groq AI Career Mentor REST Client for SkillForge
 * ============================================================================
 *
 * Backend endpoint:
 *   POST /api/ai/recommend
 *   Body:    { query: string }   <- AIQueryRequest
 *   Returns: ApiResponse<AIResponse>
 *
 * AIResponse shape (unwrapped from ApiResponse.data):
 * {
 *   currentLevel:      string
 *   skillGaps:         string[]
 *   recommendedTopics: string[]
 *   weeklyPlan:        string       (newline-delimited week entries)
 *   suggestedProjects: string[]
 *   estimatedTimeline: string
 *   rawResponse:       string       (raw Groq JSON content, for debugging)
 * }
 *
 * Security Note:
 *   The Groq API key NEVER appears in frontend code.
 *   All calls go to our own Spring Boot backend (/api/ai/recommend)
 *   which injects the key from application.properties server-side.
 *
 * Performance:
 *   Groq's LPU™ inference typically responds in 0.8 – 2.5 seconds.
 *   Timeout set to 30s to handle rare cold-start delays.
 * ============================================================================
 */

import axiosInstance from './axiosInstance';

/**
 * Send a career guidance query to SkillForge's Groq-powered AI backend.
 *
 * @param {string} query - The user's career/skill question (max 1000 chars per backend validation)
 * @returns {Promise} - Axios promise resolving to ApiResponse<AIResponse>
 *
 * @example
 *   const res = await getAIRecommendation('How do I become a Microservices Architect?');
 *   const recommendation = res.data; // AIResponse object
 */
export const getAIRecommendation = (query) =>
  axiosInstance.post('/ai/recommend', { query }, { timeout: 30000 });

// Default export as object for backward-compat
const aiApi = {
  getAIRecommendation,
  // Legacy aliases (kept so old code won't break during transition)
  generateLearningPath: (data) => axiosInstance.post('/ai/recommend', data, { timeout: 30000 }),
  getRecommendations:   (params) => axiosInstance.get('/ai/recommend', { params }),
  chatWithAssistant:    (data) => getAIRecommendation(data?.message || data?.query || ''),
};

export default aiApi;
