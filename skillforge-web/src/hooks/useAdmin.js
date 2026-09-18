/**
 * ============================================================================
 * useAdmin.js - React Query Hooks for Platform Administration
 * ============================================================================
 *
 * Provides reactive data fetching and mutation hooks for the SkillForge
 * Admin Panel:
 *
 * 1. useAdminUsers()
 *    - Query key: ['admin', 'users']
 *    - Fetches the live list of all registered users from GET /api/admin/users
 *    - Automatically unwraps ApiResponse.data envelope
 *
 * 2. useDeactivateUser()
 *    - Mutation hook for PATCH /api/admin/users/{userId}/deactivate
 *    - Invalidates ['admin', 'users'] on success for instantaneous UI refresh
 *    - Displays toast feedback
 *
 * 3. useActivateUser()
 *    - Mutation hook for PATCH /api/admin/users/{userId}/activate
 *    - Invalidates ['admin', 'users'] on success
 *    - Displays toast feedback
 * ============================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../api/adminApi';
import toast from 'react-hot-toast';

/**
 * Hook to retrieve all registered users across the platform.
 *
 * @returns {Object} { data: users, isLoading, isError, error, refetch }
 */
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await adminApi.getAllUsers();
      // axiosInstance returns response.data (ApiResponse)
      // Backend ApiResponse shape: { success: true, message: '...', data: UserResponse[] }
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
    staleTime: 60 * 1000, // 1 minute fresh cache
  });
};

/**
 * Hook to deactivate a user account.
 *
 * @returns {Object} TanStack Mutation object
 */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => adminApi.deactivateUser(userId),
    onSuccess: () => {
      // Invalidate admin users cache to trigger instant re-fetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated successfully! 🛡️', {
        duration: 3500,
        icon: '🔒',
      });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || 'Failed to update user status';
      toast.error(msg, { duration: 4000 });
    },
  });
};

/**
 * Hook to re-activate a deactivated user account.
 *
 * @returns {Object} TanStack Mutation object
 */
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => adminApi.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User account activated successfully! 🟢', {
        duration: 3500,
        icon: '✅',
      });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || 'Failed to activate user';
      toast.error(msg, { duration: 4000 });
    },
  });
};

export default {
  useAdminUsers,
  useDeactivateUser,
  useActivateUser,
};
