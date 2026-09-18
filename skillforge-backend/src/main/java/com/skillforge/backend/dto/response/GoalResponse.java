package com.skillforge.backend.dto.response;

import com.skillforge.backend.enums.GoalCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response payload for learning and career goals.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {

    private Long id;
    private String title;
    private String description;
    private GoalCategory category;
    private Integer targetDays;
    private Integer dailyHours;
    private Integer progress;
    private Boolean isCompleted;
    private Integer taskCount;
    private Integer completedTaskCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}