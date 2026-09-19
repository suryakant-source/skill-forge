/**
 * useTasks.js - React Query hooks for task operations.
 * All mutations invalidate related queries so Dashboard and Goal Detail update in real-time.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import taskApi from '../api/taskApi';

/** Invalidation helper — refreshes tasks + goal progress + dashboard */
const invalidateAll = (queryClient, goalId) => {
  queryClient.invalidateQueries({ queryKey: ['tasks', goalId] });
  queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
  queryClient.invalidateQueries({ queryKey: ['goals', String(goalId)] });
  queryClient.invalidateQueries({ queryKey: ['goals'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-goals'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
};

/** Fetch tasks for a specific goal */
export function useTasks(goalId) {
  return useQuery({
    queryKey: ['tasks', goalId],
    queryFn: () => taskApi.getTasksByGoal(goalId),
    enabled: !!goalId,
  });
}

/** Create a new task under a goal */
export function useCreateTask(goalId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => taskApi.createTask(goalId, data),
    onSuccess: () => {
      invalidateAll(queryClient, goalId);
      Alert.alert('Success', 'Task added! 📋');
    },
    onError: () => Alert.alert('Error', 'Failed to add task'),
  });
}

/** Toggle / patch task status */
export function useUpdateTaskStatus(goalId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }) => taskApi.updateTaskStatus(taskId, status),
    onSuccess: () => invalidateAll(queryClient, goalId),
    onError: () => Alert.alert('Error', 'Failed to update task status'),
  });
}

/** Delete a task */
export function useDeleteTask(goalId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => taskApi.deleteTask(taskId),
    onSuccess: () => {
      invalidateAll(queryClient, goalId);
      Alert.alert('Deleted', 'Task removed! 🗑️');
    },
    onError: () => Alert.alert('Error', 'Failed to delete task'),
  });
}
