/**
 * ============================================================================
 * useAI.js - React Query Hook for Groq AI Recommendations
 * ============================================================================
 *
 * WHY useMutation (not useQuery)?
 * ─────────────────────────────────
 * AI queries are user-triggered, one-shot actions — not passive data fetching.
 * useMutation is the correct React Query primitive for POST requests that
 * happen on user demand (button click), not on component mount.
 *
 * USAGE:
 *   const { mutate, isPending, data, error } = useAIRecommendation();
 *   mutate('How do I become a microservices architect?');
 *
 * DATA SHAPE returned in mutation.data:
 *   {
 *     currentLevel:      string
 *     skillGaps:         string[]
 *     recommendedTopics: string[]
 *     weeklyPlan:        string
 *     suggestedProjects: string[]
 *     estimatedTimeline: string
 *     rawResponse:       string
 *   }
 * ============================================================================
 */

import { useMutation } from '@tanstack/react-query';
import { getAIRecommendation } from '../api/aiApi';
import toast from 'react-hot-toast';

/**
 * useAIRecommendation
 *
 * Returns a mutation hook. Call mutate(queryString) to trigger Groq AI.
 *
 * State exposed:
 *   isPending  - true while Groq API call is in-flight (show spinner)
 *   data       - AIResponse from backend (unwrapped from ApiResponse.data)
 *   error      - Error object if request failed
 *   mutate     - Function to trigger the AI call
 *   reset      - Function to clear result and start fresh
 */
export const useAIRecommendation = () => {
  return useMutation({
    // mutationFn receives the query string, calls the backend
    mutationFn: (query) => getAIRecommendation(query),

    // select equivalent: unwrap ApiResponse envelope
    // Backend returns: { success, message, data: AIResponse }
    // axiosInstance interceptor may already strip Axios envelope, so we handle both shapes
    onSuccess: (res) => {
      toast.success('Groq AI Roadmap generated! ⚡🤖', {
        duration: 3000,
        icon: '🚀',
      });
    },

    onError: (error) => {
      // Handle different error shapes from Axios + our backend
      const backendMsg = error?.response?.data?.message;
      const msg = backendMsg || error?.message || 'AI request failed. Please check Groq API key.';
      toast.error(msg, { duration: 5000 });
    },
  });
};

// Helper: extract AIResponse from the mutation result
// (handles both { data: AIResponse } and raw AIResponse shapes)
export const extractAIData = (mutationData) => {
  if (!mutationData) return null;
  // If axiosInstance returned { data: { success, message, data: AIResponse } }
  if (mutationData?.data?.data) return mutationData.data.data;
  // If interceptor already stripped outer: { success, message, data: AIResponse }
  if (mutationData?.data) return mutationData.data;
  // Raw AIResponse
  return mutationData;
};

export default useAIRecommendation;
