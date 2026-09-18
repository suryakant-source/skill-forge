package com.skillforge.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Aggregated dashboard metrics and progress statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private Long totalGoals;
    private Long completedGoals;
    private Long pendingGoals;
    private Long totalTasks;
    private Long completedTasks;
    private Long pendingTasks;
    private Long inProgressTasks;
    private Double overallProgress;
    private Integer currentStreak;
    private List<GoalProgressItem> goalProgressList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalProgressItem {
        private Long goalId;
        private String title;
        private Integer progress;
        private Boolean isCompleted;
    }
}