package com.skillforge.backend.dto.request;

import com.skillforge.backend.enums.GoalCategory;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for updating an existing goal.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGoalRequest {

    @NotBlank(message = "Goal title is required")
    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Category is required")
    private GoalCategory category;

    @NotNull(message = "Target days is required")
    @Min(value = 1, message = "Target days must be at least 1")
    @Max(value = 365, message = "Target days cannot exceed 365")
    private Integer targetDays;

    @NotNull(message = "Daily hours is required")
    @Min(value = 1, message = "Daily hours must be at least 1")
    @Max(value = 24, message = "Daily hours cannot exceed 24")
    private Integer dailyHours;

    private Boolean isCompleted;
}