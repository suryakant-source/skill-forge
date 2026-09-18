package com.skillforge.backend.dto.request;

import com.skillforge.backend.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for updating task details and execution status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Task status is required")
    private TaskStatus status;
}