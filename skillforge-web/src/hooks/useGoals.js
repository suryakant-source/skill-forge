import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import goalApi from '../api/goalApi';
import toast from 'react-hot-toast';

export const useGoals = (params = {}) => {
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ['goals', params],
    queryFn: () => goalApi.getGoals(params),
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => goalApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create goal');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => goalApi.updateGoal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal updated successfully!');
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
      toast.success('Goal deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete goal');
    },
  });

  return {
    ...goalsQuery,
    goals: goalsQuery.data?.data || goalsQuery.data || [],
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  };
};

export const useGoalDetail = (id) => {
  return useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalApi.getGoalById(id),
    enabled: Boolean(id),
  });
};

export default useGoals;
