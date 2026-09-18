package com.skillforge.backend.service;

import com.skillforge.backend.dto.request.CreateGoalRequest;
import com.skillforge.backend.dto.request.UpdateGoalRequest;
import com.skillforge.backend.dto.response.GoalResponse;

import java.util.List;

/**
 * Service interface for goal lifecycle and progress tracking.
 */
public interface GoalService {
    GoalResponse createGoal(Long userId, CreateGoalRequest request);
    GoalResponse createGoal(String email, CreateGoalRequest request);
    List<GoalResponse> getAllGoals(Long userId);
    List<GoalResponse> getAllGoals(String email);
    default List<GoalResponse> getGoalsByUser(String email) {
        return getAllGoals(email);
    }
    GoalResponse getGoalById(Long userId, Long goalId);
    GoalResponse getGoalById(String email, Long goalId);
    GoalResponse updateGoal(Long userId, Long goalId, UpdateGoalRequest request);
    GoalResponse updateGoal(String email, Long goalId, UpdateGoalRequest request);
    void deleteGoal(Long userId, Long goalId);
    void deleteGoal(String email, Long goalId);
    void updateGoalProgress(Long goalId);
}