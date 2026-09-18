package com.skillforge.backend.controller;

import com.skillforge.backend.dto.request.CreateTaskRequest;
import com.skillforge.backend.dto.request.UpdateTaskRequest;
import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.dto.response.TaskResponse;
import com.skillforge.backend.enums.TaskStatus;
import com.skillforge.backend.exception.BadRequestException;
import com.skillforge.backend.service.TaskService;
import com.skillforge.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for task management under goals and individual task updates.
 * Routes: /api/goals/{goalId}/tasks and /api/tasks/{taskId}
 * All endpoints are PROTECTED.
 */
@RestController
public class TaskController {

    private static final Logger log = LoggerFactory.getLogger(TaskController.class);

    private final TaskService taskService;
    private final SecurityUtils securityUtils;

    public TaskController(TaskService taskService, SecurityUtils securityUtils) {
        this.taskService = taskService;
        this.securityUtils = securityUtils;
    }

    /**
     * Create a new task under a specific goal.
     * POST /api/goals/{goalId}/tasks
     */
    @PostMapping("/api/goals/{goalId}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable Long goalId,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: POST /api/goals/{}/tasks for userId: {}", goalId, userId);
        TaskResponse response = taskService.createTask(userId, goalId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", response));
    }

    /**
     * Retrieve all tasks under a specific goal.
     * GET /api/goals/{goalId}/tasks
     */
    @GetMapping("/api/goals/{goalId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByGoal(@PathVariable Long goalId) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: GET /api/goals/{}/tasks for userId: {}", goalId, userId);
        List<TaskResponse> tasks = taskService.getTasksByGoal(userId, goalId);
        return ResponseEntity.ok(ApiResponse.success("Tasks for goal retrieved successfully", tasks));
    }

    /**
     * Update task title and description.
     * PUT /api/tasks/{taskId}
     */
    @PutMapping("/api/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: PUT /api/tasks/{} for userId: {}", taskId, userId);
        TaskResponse response = taskService.updateTask(userId, taskId, request);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", response));
    }

    /**
     * Update task status (PENDING -> IN_PROGRESS -> COMPLETED) and recalculate goal progress.
     * PATCH /api/tasks/{taskId}/status
     * Body: { "status": "COMPLETED" }
     */
    @PatchMapping("/api/tasks/{taskId}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> body
    ) {
        Long userId = securityUtils.getCurrentUserId();
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            throw new BadRequestException("Status field is required");
        }

        TaskStatus status;
        try {
            status = TaskStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + statusStr + ". Must be PENDING, IN_PROGRESS, or COMPLETED");
        }

        log.info("Endpoint called: PATCH /api/tasks/{}/status to {} for userId: {}", taskId, status, userId);
        TaskResponse response = taskService.updateTaskStatus(userId, taskId, status);
        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", response));
    }

    /**
     * Delete a task and update parent goal progress.
     * DELETE /api/tasks/{taskId}
     */
    @DeleteMapping("/api/tasks/{taskId}")
    public ResponseEntity<ApiResponse<String>> deleteTask(@PathVariable Long taskId) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: DELETE /api/tasks/{} for userId: {}", taskId, userId);
        taskService.deleteTask(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", "Task deleted successfully"));
    }
}