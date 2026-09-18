package com.skillforge.backend.service.impl;

import com.skillforge.backend.dto.request.CreateGoalRequest;
import com.skillforge.backend.dto.request.UpdateGoalRequest;
import com.skillforge.backend.dto.response.GoalResponse;
import com.skillforge.backend.entity.Goal;
import com.skillforge.backend.entity.Task;
import com.skillforge.backend.entity.User;
import com.skillforge.backend.enums.TaskStatus;
import com.skillforge.backend.exception.ResourceNotFoundException;
import com.skillforge.backend.exception.UnauthorizedException;
import com.skillforge.backend.repository.GoalRepository;
import com.skillforge.backend.repository.TaskRepository;
import com.skillforge.backend.repository.UserRepository;
import com.skillforge.backend.service.GoalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of GoalService managing goals, permissions, and automatic progress calculation.
 */
@Service
public class GoalServiceImpl implements GoalService {

    private static final Logger log = LoggerFactory.getLogger(GoalServiceImpl.class);

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
    public GoalResponse createGoal(Long userId, CreateGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return executeCreateGoal(user, request);
    }

    @Override
    @Transactional
    public GoalResponse createGoal(String email, CreateGoalRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return executeCreateGoal(user, request);
    }

    private GoalResponse executeCreateGoal(User user, CreateGoalRequest request) {
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

        Goal saved = goalRepository.save(goal);
        log.info("Goal created ID: {} for user: {}", saved.getId(), user.getEmail());
        return mapToGoalResponse(saved);
    }

    @Override
    public List<GoalResponse> getAllGoals(Long userId) {
        return goalRepository.findByUserId(userId).stream()
                .map(this::mapToGoalResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GoalResponse> getAllGoals(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return getAllGoals(user.getId());
    }

    @Override
    public GoalResponse getGoalById(Long userId, Long goalId) {
        Goal goal = getGoalAndVerifyOwnership(goalId, userId);
        return mapToGoalResponse(goal);
    }

    @Override
    public GoalResponse getGoalById(String email, Long goalId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return getGoalById(user.getId(), goalId);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long userId, Long goalId, UpdateGoalRequest request) {
        Goal goal = getGoalAndVerifyOwnership(goalId, userId);

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

        Goal saved = goalRepository.save(goal);
        log.info("Updated goal ID: {}", goalId);
        return mapToGoalResponse(saved);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(String email, Long goalId, UpdateGoalRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return updateGoal(user.getId(), goalId, request);
    }

    @Override
    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        Goal goal = getGoalAndVerifyOwnership(goalId, userId);
        goalRepository.delete(goal);
        log.info("Deleted goal ID: {} and its cascading tasks", goalId);
    }

    @Override
    @Transactional
    public void deleteGoal(String email, Long goalId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        deleteGoal(user.getId(), goalId);
    }

    @Override
    @Transactional
    public void updateGoalProgress(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        List<Task> tasks = taskRepository.findByGoalId(goalId);
        if (tasks.isEmpty()) {
            goal.setProgress(0);
            goal.setIsCompleted(false);
        } else {
            long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
            int progress = (int) Math.round(((double) completed / tasks.size()) * 100);
            goal.setProgress(progress);
            goal.setIsCompleted(progress >= 100);
        }
        goalRepository.save(goal);
        log.info("Recalculated progress for goal ID {}: {}%", goalId, goal.getProgress());
    }

    private Goal getGoalAndVerifyOwnership(Long goalId, Long userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            log.warn("Unauthorized goal access attempt: User {} on Goal {}", userId, goalId);
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