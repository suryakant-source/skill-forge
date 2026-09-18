package com.skillforge.backend.service;

import com.skillforge.backend.dto.request.UpdateProfileRequest;
import com.skillforge.backend.dto.response.UserResponse;

import java.util.List;

/**
 * Service interface for user profile, skills, and admin management.
 */
public interface UserService {
    UserResponse getProfile(Long userId);
    UserResponse getProfile(String email);
    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    UserResponse addSkill(Long userId, String skillName);
    void removeSkill(Long userId, Long skillId);
    List<UserResponse> getAllUsers();
    void deactivateUser(Long userId);
}