package com.skillforge.backend.controller;

import com.skillforge.backend.dto.request.CreateGoalRequest;
import com.skillforge.backend.dto.request.UpdateGoalRequest;
import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.dto.response.GoalResponse;
import com.skillforge.backend.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            Authentication authentication,
            @Valid @RequestBody CreateGoalRequest request
    ) {
        GoalResponse response = goalService.createGoal(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goal created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals(Authentication authentication) {
        List<GoalResponse> goals = goalService.getGoalsByUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Goals retrieved successfully", goals));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoalById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        GoalResponse response = goalService.getGoalById(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Goal details retrieved", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateGoalRequest request
    ) {
        GoalResponse response = goalService.updateGoal(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Goal updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            Authentication authentication,
            @PathVariable Long id
    ) {
        goalService.deleteGoal(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", null));
    }
}