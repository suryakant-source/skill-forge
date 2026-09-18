/**
 * ============================================================================
 * useProfile.js - React Query Hooks for User Profile & Skills
 * ============================================================================
 *
 * WHY REACT QUERY FOR PROFILE?
 * ─────────────────────────────
 * Profile data needs to stay in sync across:
 *   - ProfileCard (name, email, avatar)
 *   - EditProfileForm (pre-populated fields)
 *   - DashboardNavbar (user display name)
 *   - AuthContext (global user state)
 *
 * All mutations invalidate ['userProfile'] so every subscriber re-renders
 * immediately after any change — no stale data.
 *
 * CACHE KEY:
 *   ['userProfile']  -> single user profile (query)
 *
 * SKILL ID REQUIREMENT:
 *   Backend DELETE /api/users/skills/{skillId} needs the DB row ID.
 *   UserResponse.skills now returns [{ id, skillName }] objects.
 *   useRemoveSkill() receives skillId directly.
 * ============================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userApi from '../api/userApi';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// useProfile - Fetch current user's full profile with skills list
// ─────────────────────────────────────────────────────────────────────────────
export const useProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: userApi.getProfile,
    // Backend ApiResponse: { success, message, data: UserResponse }
    // axiosInstance strips Axios envelope -> we get ApiResponse directly
    select: (res) => {
      if (res?.data) return res.data;   // { success, message, data: UserResponse }
      return res;                        // already unwrapped
    },
    staleTime: 2 * 60 * 1000,           // 2 minutes — profile doesn't change often
    retry: 1,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useUpdateProfile - Mutate profile fields (name, bio, careerGoal, experienceLevel)
// Invalidates ['userProfile'] + updates AuthContext global user state
// ─────────────────────────────────────────────────────────────────────────────
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (profileData) => userApi.updateProfile(profileData),
    onSuccess: (res) => {
      // 1. Re-fetch profile so all profile UI instantly reflects new data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      // 2. Sync updated name into AuthContext (Navbar will show new name)
      const updated = res?.data ?? res;
      if (updated?.name) {
        updateUser({ name: updated.name });
      }

      toast.success('Profile updated successfully! ✨');
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update profile';
      toast.error(msg);
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useAddSkill - Add a new skill name to profile
// Backend validates uniqueness and returns updated UserResponse
// ─────────────────────────────────────────────────────────────────────────────
export const useAddSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillName) => userApi.addSkill(skillName),
    onSuccess: () => {
      // Invalidate profile so skills list re-fetches with new skill + its ID
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Skill added! 💡');
    },
    onError: (error) => {
      // Backend throws BadRequestException for duplicates ("Skill 'Java' is already added")
      const msg = error?.response?.data?.message || error?.message || 'Failed to add skill';
      toast.error(msg);
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useRemoveSkill - Delete a skill by its database row ID
// @param skillId: number — from SkillResponse.id in the profile skills array
// ─────────────────────────────────────────────────────────────────────────────
export const useRemoveSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId) => userApi.removeSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Skill removed! 🗑️');
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to remove skill';
      toast.error(msg);
    },
  });
};
