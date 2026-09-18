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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of DashboardService calculating goal & task statistics and overall progress average.
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;

    public DashboardServiceImpl(UserRepository userRepository, GoalRepository goalRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public DashboardResponse getDashboardStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return calculateMetrics(user);
    }

    @Override
    public DashboardResponse getDashboardStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return calculateMetrics(user);
    }

    private DashboardResponse calculateMetrics(User user) {
        Long userId = user.getId();
        log.info("Calculating dashboard stats for user ID: {}", userId);

        long totalGoals = goalRepository.countByUserId(userId);
        long completedGoals = goalRepository.countByUserIdAndIsCompleted(userId, true);
        long pendingGoals = totalGoals - completedGoals;

        long totalTasks = taskRepository.countByUserId(userId);
        long completedTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.COMPLETED);
        long inProgressTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long pendingTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.PENDING);

        List<Goal> goals = goalRepository.findByUserId(userId);

        // Calculate overallProgress as average of all goal progress values (safe from divide-by-zero)
        double overallProgress = 0.0;
        if (!goals.isEmpty()) {
            double sum = 0.0;
            for (Goal g : goals) {
                sum += (g.getProgress() != null ? g.getProgress() : 0);
            }
            overallProgress = Math.round((sum / goals.size()) * 100.0) / 100.0;
        }

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