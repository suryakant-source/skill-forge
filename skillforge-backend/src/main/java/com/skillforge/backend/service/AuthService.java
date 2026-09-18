package com.skillforge.backend.service;

import com.skillforge.backend.dto.request.LoginRequest;
import com.skillforge.backend.dto.request.SignupRequest;
import com.skillforge.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
}