package com.skillforge.backend.controller;

import com.skillforge.backend.dto.request.CreateTaskRequest;
import com.skillforge.backend.dto.request.UpdateTaskRequest;
import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.dto.response.TaskResponse;
import com.skillforge.backend.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/goal/{goalId}")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            Authentication authentication,
            @PathVariable Long goalId,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        TaskResponse response = taskService.createTask(authentication.getName(), goalId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", response));
    }

    @GetMapping("/goal/{goalId}")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByGoal(
            Authentication authentication,
            @PathVariable Long goalId
    ) {
        List<TaskResponse> tasks = taskService.getTasksByGoal(authentication.getName(), goalId);
        return ResponseEntity.ok(ApiResponse.success("Tasks for goal retrieved successfully", tasks));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getUserTasks(Authentication authentication) {
        List<TaskResponse> tasks = taskService.getTasksByUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("User tasks retrieved successfully", tasks));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        TaskResponse response = taskService.updateTask(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            Authentication authentication,
            @PathVariable Long id
    ) {
        taskService.deleteTask(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}