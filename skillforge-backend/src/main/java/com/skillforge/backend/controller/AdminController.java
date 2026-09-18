package com.skillforge.backend.controller;

import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.dto.response.UserResponse;
import com.skillforge.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller providing administrative actions.
 * Base URL: /api/admin
 * PROTECTED + REQUIRES ADMIN ROLE
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get list of all registered users in the platform.
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        log.info("Endpoint called: GET /api/admin/users");
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("All users retrieved successfully", users));
    }

    /**
     * Deactivate a user account by ID.
     * PATCH /api/admin/users/{userId}/deactivate
     */
    @PatchMapping("/users/{userId}/deactivate")
    public ResponseEntity<ApiResponse<String>> deactivateUser(@PathVariable Long userId) {
        log.info("Endpoint called: PATCH /api/admin/users/{}/deactivate", userId);
        userService.deactivateUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", "User deactivated successfully"));
    }
}