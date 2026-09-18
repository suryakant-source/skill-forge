package com.skillforge.backend.service;

import com.skillforge.backend.dto.request.CreateTaskRequest;
import com.skillforge.backend.dto.request.UpdateTaskRequest;
import com.skillforge.backend.dto.response.TaskResponse;
import com.skillforge.backend.enums.TaskStatus;

import java.util.List;

/**
 * Service interface for task management under goals.
 */
public interface TaskService {
    TaskResponse createTask(Long userId, Long goalId, CreateTaskRequest request);
    TaskResponse createTask(String email, Long goalId, CreateTaskRequest request);
    List<TaskResponse> getTasksByGoal(Long userId, Long goalId);
    List<TaskResponse> getTasksByGoal(String email, Long goalId);
    List<TaskResponse> getTasksByUser(Long userId);
    List<TaskResponse> getTasksByUser(String email);
    TaskResponse updateTask(Long userId, Long taskId, UpdateTaskRequest request);
    TaskResponse updateTask(String email, Long taskId, UpdateTaskRequest request);
    TaskResponse updateTaskStatus(Long userId, Long taskId, TaskStatus status);
    TaskResponse updateTaskStatus(String email, Long taskId, TaskStatus status);
    void deleteTask(Long userId, Long taskId);
    void deleteTask(String email, Long taskId);
}