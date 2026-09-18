package com.skillforge.backend.service.impl;

import com.skillforge.backend.dto.request.CreateGoalRequest;
import com.skillforge.backend.dto.request.UpdateGoalRequest;
import com.skillforge.backend.dto.response.GoalResponse;
import com.skillforge.backend.entity.Goal;
import com.skillforge.backend.entity.User;
import com.skillforge.backend.enums.TaskStatus;
import com.skillforge.backend.exception.ResourceNotFoundException;
import com.skillforge.backend.exception.UnauthorizedException;
import com.skillforge.backend.repository.GoalRepository;
import com.skillforge.backend.repository.TaskRepository;
import com.skillforge.backend.repository.UserRepository;
import com.skillforge.backend.service.GoalService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public GoalServiceImpl(GoalRepository goalRepository, UserRepository userRepository, TaskRepository taskRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    @Transactional
    public GoalResponse createGoal(String userEmail, CreateGoalRequest request) {
        User user = getUserByEmail(userEmail);

        Goal goal = Goal.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .targetDays(request.getTargetDays())
                .dailyHours(request.getDailyHours())
                .progress(0)
                .isCompleted(false)
                .build();

        Goal savedGoal = goalRepository.save(goal);
        return mapToGoalResponse(savedGoal);
    }

    @Override
    public List<GoalResponse> getGoalsByUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        return goalRepository.findByUserId(user.getId()).stream()
                .map(this::mapToGoalResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GoalResponse getGoalById(String userEmail, Long goalId) {
        User user = getUserByEmail(userEmail);
        Goal goal = getGoalAndVerifyOwnership(goalId, user.getId());
        return mapToGoalResponse(goal);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(String userEmail, Long goalId, UpdateGoalRequest request) {
        User user = getUserByEmail(userEmail);
        Goal goal = getGoalAndVerifyOwnership(goalId, user.getId());

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            goal.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            goal.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            goal.setCategory(request.getCategory());
        }
        if (request.getTargetDays() != null) {
            goal.setTargetDays(request.getTargetDays());
        }
        if (request.getDailyHours() != null) {
            goal.setDailyHours(request.getDailyHours());
        }
        if (request.getIsCompleted() != null) {
            goal.setIsCompleted(request.getIsCompleted());
            if (request.getIsCompleted()) {
                goal.setProgress(100);
            }
        }

        Goal updatedGoal = goalRepository.save(goal);
        return mapToGoalResponse(updatedGoal);
    }

    @Override
    @Transactional
    public void deleteGoal(String userEmail, Long goalId) {
        User user = getUserByEmail(userEmail);
        Goal goal = getGoalAndVerifyOwnership(goalId, user.getId());
        goalRepository.delete(goal);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Goal getGoalAndVerifyOwnership(Long goalId, Long userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this goal");
        }
        return goal;
    }

    private GoalResponse mapToGoalResponse(Goal goal) {
        int totalTasks = taskRepository.findByGoalId(goal.getId()).size();
        int completedTasks = (int) taskRepository.findByGoalIdAndStatus(goal.getId(), TaskStatus.COMPLETED).size();

        int progress = goal.getProgress() != null ? goal.getProgress() : 0;
        if (totalTasks > 0) {
            progress = (int) Math.round(((double) completedTasks / totalTasks) * 100);
        }

        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .category(goal.getCategory())
                .targetDays(goal.getTargetDays())
                .dailyHours(goal.getDailyHours())
                .progress(progress)
                .isCompleted(goal.getIsCompleted())
                .taskCount(totalTasks)
                .completedTaskCount(completedTasks)
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}