package com.skillforge.backend.controller;

import com.skillforge.backend.dto.request.UpdateProfileRequest;
import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.dto.response.UserResponse;
import com.skillforge.backend.exception.BadRequestException;
import com.skillforge.backend.service.UserService;
import com.skillforge.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller handling user profile and skill management.
 * All endpoints are PROTECTED and require JWT Bearer token.
 * Base URL: /api/users
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final SecurityUtils securityUtils;

    public UserController(UserService userService, SecurityUtils securityUtils) {
        this.userService = userService;
        this.securityUtils = securityUtils;
    }

    /**
     * Get profile of currently authenticated user.
     * GET /api/users/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: GET /api/users/profile for userId: {}", userId);
        UserResponse response = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", response));
    }

    /**
     * Update profile details of currently authenticated user.
     * PUT /api/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: PUT /api/users/profile for userId: {}", userId);
        UserResponse response = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    /**
     * Add a new skill to user profile.
     * POST /api/users/skills
     * Body: { "skillName": "Java" }
     */
    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<UserResponse>> addSkill(@RequestBody Map<String, String> request) {
        Long userId = securityUtils.getCurrentUserId();
        String skillName = request.get("skillName");
        if (skillName == null || skillName.trim().isEmpty()) {
            throw new BadRequestException("skillName is required");
        }
        log.info("Endpoint called: POST /api/users/skills with skill: {} for userId: {}", skillName, userId);
        UserResponse response = userService.addSkill(userId, skillName);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Skill added successfully", response));
    }

    /**
     * Remove a skill from user profile.
     * DELETE /api/users/skills/{skillId}
     */
    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<ApiResponse<String>> removeSkill(@PathVariable Long skillId) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: DELETE /api/users/skills/{} for userId: {}", skillId, userId);
        userService.removeSkill(userId, skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill removed successfully", "Skill removed successfully"));
    }
}