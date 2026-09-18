/**
 * ============================================================================
 * useTasks.js - React Query Hooks for Task Server State
 * ============================================================================
 *
 * MULTI-QUERY CACHE INVALIDATION:
 * When a task status changes (e.g., PENDING -> COMPLETED):
 *   1. ['tasks', goalId]   -> Task list re-fetches (task badge updates)
 *   2. ['all-tasks']       -> Aggregated tasks across goals re-fetches
 *   3. ['goal', goalId]    -> GoalDetailPage hero progress bar re-renders
 *   4. ['goals']           -> GoalsPage grid card progress bars re-render
 *   5. ['dashboard']       -> Dashboard stats card (completed count) re-renders
 *
 * Backend already computes Goal.progress via formula:
 *   progress = (completedTasks / totalTasks) * 100
 * Invalidation triggers instant, reactive updates across all views.
 * ============================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taskApi from '../api/taskApi';
import toast from 'react-hot-toast';

// Helper to invalidate all related queries
const invalidateTaskDependencies = (queryClient, goalId) => {
  if (goalId) {
    queryClient.invalidateQueries({ queryKey: ['tasks', goalId] });
    queryClient.invalidateQueries({ queryKey: ['tasks', String(goalId)] });
    queryClient.invalidateQueries({ queryKey: ['tasks', Number(goalId)] });
    queryClient.invalidateQueries({ queryKey: ['goal', String(goalId)] });
    queryClient.invalidateQueries({ queryKey: ['goal', Number(goalId)] });
  }
  queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
  queryClient.invalidateQueries({ queryKey: ['goals'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
};

// ----------------------------------------------------------------------------
// useGoalTasks - Fetch all tasks for a specific goal
// Primary hook for GoalDetailPage task list rendering
// ----------------------------------------------------------------------------
export const useGoalTasks = (goalId) => {
  return useQuery({
    queryKey: ['tasks', goalId],
    queryFn: () => taskApi.getTasksByGoal(goalId),
    enabled: Boolean(goalId),
    select: (res) => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
  });
};

// ----------------------------------------------------------------------------
// useAllTasks - Fetch aggregated tasks across all goals (for Kanban board)
// ----------------------------------------------------------------------------
export const useAllTasks = (goals = []) => {
  const goalIds = goals.map((g) => g.id).filter(Boolean);

  return useQuery({
    queryKey: ['all-tasks', goalIds.sort().join(',')],
    queryFn: async () => {
      if (goalIds.length === 0) return [];
      const responses = await Promise.all(
        goalIds.map((id) => taskApi.getTasksByGoal(id).catch(() => ({ data: [] })))
      );
      const all = [];
      responses.forEach((res) => {
        const list = Array.isArray(res) ? res : res?.data ?? [];
        all.push(...list);
      });
      return all;
    },
    enabled: goalIds.length > 0,
    select: (data) => data ?? [],
  });
};

// ----------------------------------------------------------------------------
// useCreateTask - Create a new task under a parent goal
// ----------------------------------------------------------------------------
export const useCreateTask = (goalId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      const targetGoalId = goalId || data.goalId;
      return taskApi.createTask(targetGoalId, data);
    },
    onSuccess: (_, variables) => {
      const targetGoalId = goalId || variables?.goalId;
      invalidateTaskDependencies(queryClient, targetGoalId);
      toast.success('Task added successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add task');
    },
  });
};

// ----------------------------------------------------------------------------
// useUpdateTaskStatus - Change task status (PENDING / IN_PROGRESS / COMPLETED)
// ----------------------------------------------------------------------------
export const useUpdateTaskStatus = (goalId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }) => taskApi.updateTaskStatus(taskId, status),
    onSuccess: (_, variables) => {
      const targetGoalId = goalId || variables?.goalId;
      invalidateTaskDependencies(queryClient, targetGoalId);
      toast.success('Task status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
};

// ----------------------------------------------------------------------------
// useUpdateTask - Update task title, description, status
// ----------------------------------------------------------------------------
export const useUpdateTask = (goalId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }) => taskApi.updateTask(taskId, data),
    onSuccess: (_, variables) => {
      const targetGoalId = goalId || variables?.goalId;
      invalidateTaskDependencies(queryClient, targetGoalId);
      toast.success('Task updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });
};

// ----------------------------------------------------------------------------
// useDeleteTask - Permanently delete a task
// ----------------------------------------------------------------------------
export const useDeleteTask = (goalId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId) => taskApi.deleteTask(taskId),
    onSuccess: () => {
      invalidateTaskDependencies(queryClient, goalId);
      toast.success('Task deleted!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });
};

// ----------------------------------------------------------------------------
// useTasks - Composite hook for backward compatibility
// ----------------------------------------------------------------------------
export const useTasks = (goalId) => {
  const queryClient = useQueryClient();
  const tasksQuery = useGoalTasks(goalId);

  const createMutation = useMutation({
    mutationFn: (data) => taskApi.createTask(goalId || data.goalId, data),
    onSuccess: () => {
      invalidateTaskDependencies(queryClient, goalId);
      toast.success('Task added successfully!');
    },
    onError: (e) => toast.error(e.message || 'Failed to add task'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, id, status }) => taskApi.updateTaskStatus(taskId || id, status),
    onSuccess: () => {
      invalidateTaskDependencies(queryClient, goalId);
      toast.success('Task status updated!');
    },
    onError: (e) => toast.error(e.message || 'Failed to update status'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, id, data }) => taskApi.updateTask(taskId || id, data),
    onSuccess: () => {
      invalidateTaskDependencies(queryClient, goalId);
      toast.success('Task updated!');
    },
    onError: (e) => toast.error(e.message || 'Failed to update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId) => taskApi.deleteTask(taskId),
    onSuccess: () => {
      invalidateTaskDependencies(queryClient, goalId);
      toast.success('Task deleted!');
    },
    onError: (e) => toast.error(e.message || 'Failed to delete task'),
  });

  return {
    ...tasksQuery,
    tasks: tasksQuery.data ?? [],
    createTask:   createMutation.mutateAsync,
    updateStatus: statusMutation.mutateAsync,
    updateTask:   updateMutation.mutateAsync,
    deleteTask:   deleteMutation.mutateAsync,
    isCreating:   createMutation.isPending,
    isUpdating:   updateMutation.isPending,
    isDeleting:   deleteMutation.isPending,
    isChangingStatus: statusMutation.isPending,
  };
};

export default useTasks;
