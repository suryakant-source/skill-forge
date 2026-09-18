package com.skillforge.backend.controller;

import com.skillforge.backend.dto.request.CreateGoalRequest;
import com.skillforge.backend.dto.request.UpdateGoalRequest;
import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.dto.response.GoalResponse;
import com.skillforge.backend.service.GoalService;
import com.skillforge.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Learning Goals CRUD management.
 * All endpoints are PROTECTED and require JWT Bearer token.
 * Base URL: /api/goals
 */
@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private static final Logger log = LoggerFactory.getLogger(GoalController.class);

    private final GoalService goalService;
    private final SecurityUtils securityUtils;

    public GoalController(GoalService goalService, SecurityUtils securityUtils) {
        this.goalService = goalService;
        this.securityUtils = securityUtils;
    }

    /**
     * Create a new learning goal.
     * POST /api/goals
     */
    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(@Valid @RequestBody CreateGoalRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: POST /api/goals for userId: {}", userId);
        GoalResponse response = goalService.createGoal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goal created successfully", response));
    }

    /**
     * Retrieve all goals belonging to current user.
     * GET /api/goals
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getAllGoals() {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: GET /api/goals for userId: {}", userId);
        List<GoalResponse> goals = goalService.getAllGoals(userId);
        return ResponseEntity.ok(ApiResponse.success("Goals fetched successfully", goals));
    }

    /**
     * Retrieve a specific goal by ID.
     * GET /api/goals/{goalId}
     */
    @GetMapping("/{goalId}")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoalById(@PathVariable Long goalId) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: GET /api/goals/{} for userId: {}", goalId, userId);
        GoalResponse response = goalService.getGoalById(userId, goalId);
        return ResponseEntity.ok(ApiResponse.success("Goal details retrieved", response));
    }

    /**
     * Update an existing goal.
     * PUT /api/goals/{goalId}
     */
    @PutMapping("/{goalId}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @PathVariable Long goalId,
            @Valid @RequestBody UpdateGoalRequest request
    ) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: PUT /api/goals/{} for userId: {}", goalId, userId);
        GoalResponse response = goalService.updateGoal(userId, goalId, request);
        return ResponseEntity.ok(ApiResponse.success("Goal updated successfully", response));
    }

    /**
     * Delete a goal and its cascading tasks.
     * DELETE /api/goals/{goalId}
     */
    @DeleteMapping("/{goalId}")
    public ResponseEntity<ApiResponse<String>> deleteGoal(@PathVariable Long goalId) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: DELETE /api/goals/{} for userId: {}", goalId, userId);
        goalService.deleteGoal(userId, goalId);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", "Goal deleted successfully"));
    }
}