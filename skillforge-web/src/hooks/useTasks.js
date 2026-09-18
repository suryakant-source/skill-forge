import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taskApi from '../api/taskApi';
import toast from 'react-hot-toast';

export const useTasks = (params = {}) => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.getTasks(params),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => taskApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => taskApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => taskApi.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update task status');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });

  return {
    ...tasksQuery,
    tasks: tasksQuery.data?.data || tasksQuery.data || [],
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};

export const useGoalTasks = (goalId) => {
  return useQuery({
    queryKey: ['tasks', 'goal', goalId],
    queryFn: () => taskApi.getTasksByGoal(goalId),
    enabled: Boolean(goalId),
  });
};

export default useTasks;
