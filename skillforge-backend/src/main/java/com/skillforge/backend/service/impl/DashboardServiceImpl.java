package com.skillforge.backend.service.impl;

import com.skillforge.backend.dto.response.DashboardResponse;
import com.skillforge.backend.entity.Goal;
import com.skillforge.backend.entity.User;
import com.skillforge.backend.enums.TaskStatus;
import com.skillforge.backend.exception.ResourceNotFoundException;
import com.skillforge.backend.repository.GoalRepository;
import com.skillforge.backend.repository.TaskRepository;
import com.skillforge.backend.repository.UserRepository;
import com.skillforge.backend.service.DashboardService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;

    public DashboardServiceImpl(UserRepository userRepository, GoalRepository goalRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public DashboardResponse getDashboardMetrics(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Long userId = user.getId();

        long totalGoals = goalRepository.countByUserId(userId);
        long completedGoals = goalRepository.countByUserIdAndIsCompleted(userId, true);
        long pendingGoals = totalGoals - completedGoals;

        long totalTasks = taskRepository.countByUserId(userId);
        long completedTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.COMPLETED);
        long inProgressTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long pendingTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.PENDING);

        double overallProgress = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0;
        overallProgress = Math.round(overallProgress * 100.0) / 100.0;

        List<Goal> goals = goalRepository.findByUserId(userId);
        List<DashboardResponse.GoalProgressItem> goalProgressList = goals.stream()
                .map(g -> DashboardResponse.GoalProgressItem.builder()
                        .goalId(g.getId())
                        .title(g.getTitle())
                        .progress(g.getProgress() != null ? g.getProgress() : 0)
                        .isCompleted(g.getIsCompleted() != null && g.getIsCompleted())
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalGoals(totalGoals)
                .completedGoals(completedGoals)
                .pendingGoals(pendingGoals)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .overallProgress(overallProgress)
                .currentStreak(0)
                .goalProgressList(goalProgressList)
                .build();
    }
}