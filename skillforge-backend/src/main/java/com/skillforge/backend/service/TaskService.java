package com.skillforge.backend.service;

import com.skillforge.backend.dto.request.CreateTaskRequest;
import com.skillforge.backend.dto.request.UpdateTaskRequest;
import com.skillforge.backend.dto.response.TaskResponse;

import java.util.List;

public interface TaskService {
    TaskResponse createTask(String userEmail, Long goalId, CreateTaskRequest request);
    List<TaskResponse> getTasksByGoal(String userEmail, Long goalId);
    List<TaskResponse> getTasksByUser(String userEmail);
    TaskResponse updateTask(String userEmail, Long taskId, UpdateTaskRequest request);
    void deleteTask(String userEmail, Long taskId);
}