package com.skillforge.backend.service;

import com.skillforge.backend.dto.request.CreateGoalRequest;
import com.skillforge.backend.dto.request.UpdateGoalRequest;
import com.skillforge.backend.dto.response.GoalResponse;

import java.util.List;

public interface GoalService {
    GoalResponse createGoal(String userEmail, CreateGoalRequest request);
    List<GoalResponse> getGoalsByUser(String userEmail);
    GoalResponse getGoalById(String userEmail, Long goalId);
    GoalResponse updateGoal(String userEmail, Long goalId, UpdateGoalRequest request);
    void deleteGoal(String userEmail, Long goalId);
}