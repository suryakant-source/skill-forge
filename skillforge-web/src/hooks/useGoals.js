/**
 * ============================================================================
 * useGoals — React Query Hooks for Goal Server State
 * ============================================================================
 *
 * Why React Query for goals?
 *   - Automatic background refetching keeps goal list fresh
 *   - Cache invalidation after mutations keeps all open views in sync
 *     (GoalsPage grid, DashboardPage summary, GoalDetailPage hero)
 *   - Deduplication prevents duplicate API calls across components
 *
 * Cache Key Convention:
 *   ['goals']          → all goals list
 *   ['goal', id]       → single goal detail
 *   ['tasks', 'goal', goalId] → tasks for a specific goal (in useTasks.js)
 *   ['dashboard']      → dashboard summary stats
 * ============================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import goalApi from '../api/goalApi';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// useGoals — Fetch all goals with optional filter params
// ─────────────────────────────────────────────────────────────
export const useGoals = (params = {}) => {
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ['goals', params],
    queryFn: () => goalApi.getAllGoals(params),
    // Normalize response shape: backend may return array directly or { data: [...] }
    select: (res) => (Array.isArray(res) ? res : res?.data ?? res ?? []),
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => goalApi.createGoal(data),
    onSuccess: () => {
      // Invalidate list AND dashboard so stats card updates immediately
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal created successfully! 🎯');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create goal');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => goalApi.updateGoal(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the list AND the specific goal detail cache
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal updated successfully! ✏️');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update goal');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => goalApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal deleted successfully! 🗑️');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete goal');
    },
  });

  return {
    ...goalsQuery,
    // Normalized goals array — always an array even if API returned unexpected shape
    goals: goalsQuery.data ?? [],
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  };
};

// ─────────────────────────────────────────────────────────────
// useGoalDetail — Fetch a single goal by ID
// ─────────────────────────────────────────────────────────────
export const useGoalDetail = (id) => {
  return useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalApi.getGoalById(id),
    enabled: Boolean(id),
    // Normalize: backend may return goal directly or wrapped in { data: ... }
    select: (res) => (res?.id ? res : res?.data ?? res),
  });
};

// Individual named exports for specific mutation hooks
export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: goalApi.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal created successfully! 🎯');
    },
    onError: (e) => toast.error(e.message || 'Failed to create goal'),
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => goalApi.updateGoal(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal updated successfully! ✏️');
    },
    onError: (e) => toast.error(e.message || 'Failed to update goal'),
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: goalApi.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal deleted successfully! 🗑️');
    },
    onError: (e) => toast.error(e.message || 'Failed to delete goal'),
  });
};

export default useGoals;
