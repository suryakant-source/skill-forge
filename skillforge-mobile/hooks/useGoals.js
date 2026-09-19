/**
 * useGoals.js - SkillForge Mobile Custom Hooks (React Query)
 * Provides query + mutation hooks for all goal operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import goalApi from '../api/goalApi';

/** Fetch all goals for the current user */
export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: goalApi.getAllGoals,
  });
}

/** Fetch a single goal by ID */
export function useGoal(id) {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => goalApi.getGoalById(id),
    enabled: !!id,
  });
}

/** Create a new goal */
export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: goalApi.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      Alert.alert('Success', 'Goal created successfully! 🎯');
    },
    onError: (err) => {
      Alert.alert('Error', err?.message || 'Failed to create goal');
    },
  });
}

/** Update an existing goal */
export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => goalApi.updateGoal(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-goals'] });
      Alert.alert('Updated', 'Goal updated! ✏️');
    },
    onError: (err) => {
      Alert.alert('Error', err?.message || 'Failed to update goal');
    },
  });
}

/** Delete a goal */
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: goalApi.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      Alert.alert('Deleted', 'Goal deleted successfully! 🗑️');
    },
    onError: (err) => {
      Alert.alert('Error', err?.message || 'Failed to delete goal');
    },
  });
}
