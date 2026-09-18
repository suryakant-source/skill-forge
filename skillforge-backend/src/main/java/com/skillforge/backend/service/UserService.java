package com.skillforge.backend.service;

import com.skillforge.backend.dto.request.UpdateProfileRequest;
import com.skillforge.backend.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    List<UserResponse> getAllUsers();
}