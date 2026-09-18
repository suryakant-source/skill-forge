package com.skillforge.backend.controller;

import com.skillforge.backend.dto.request.LoginRequest;
import com.skillforge.backend.dto.request.SignupRequest;
import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.dto.response.AuthResponse;
import com.skillforge.backend.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller handling public authentication endpoints (User Registration & Login).
 * Base URL: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user account.
     * POST /api/auth/signup
     *
     * Example Request:
     * {
     *   "name": "Suryakant",
     *   "email": "surya@example.com",
     *   "password": "Password@123",
     *   "confirmPassword": "Password@123"
     * }
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        log.info("Endpoint called: POST /api/auth/signup for email: {}", request.getEmail());
        AuthResponse response = authService.signup(request);
        log.info("Successfully registered user: {}", response.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    /**
     * Authenticate an existing user and generate a JWT Bearer token.
     * POST /api/auth/login
     *
     * Example Request:
     * {
     *   "email": "surya@example.com",
     *   "password": "Password@123"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Endpoint called: POST /api/auth/login for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        log.info("User {} successfully authenticated", response.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}