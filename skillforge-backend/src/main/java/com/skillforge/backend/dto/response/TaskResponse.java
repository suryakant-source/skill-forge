package com.skillforge.backend.dto.response;

import com.skillforge.backend.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response payload for individual actionable tasks.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Long goalId;
    private String goalTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}