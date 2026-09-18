package com.skillforge.backend.service.impl;

import com.skillforge.backend.dto.request.CreateTaskRequest;
import com.skillforge.backend.dto.request.UpdateTaskRequest;
import com.skillforge.backend.dto.response.TaskResponse;
import com.skillforge.backend.entity.Goal;
import com.skillforge.backend.entity.Task;
import com.skillforge.backend.entity.User;
import com.skillforge.backend.enums.TaskStatus;
import com.skillforge.backend.exception.ResourceNotFoundException;
import com.skillforge.backend.exception.UnauthorizedException;
import com.skillforge.backend.repository.GoalRepository;
import com.skillforge.backend.repository.TaskRepository;
import com.skillforge.backend.repository.UserRepository;
import com.skillforge.backend.service.TaskService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository, GoalRepository goalRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public TaskResponse createTask(String userEmail, Long goalId, CreateTaskRequest request) {
        User user = getUserByEmail(userEmail);
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this goal");
        }

        Task task = Task.builder()
                .user(user)
                .goal(goal)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(TaskStatus.PENDING)
                .build();

        Task savedTask = taskRepository.save(task);
        updateGoalProgress(goal);

        return mapToTaskResponse(savedTask);
    }

    @Override
    public List<TaskResponse> getTasksByGoal(String userEmail, Long goalId) {
        User user = getUserByEmail(userEmail);
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this goal");
        }

        return taskRepository.findByGoalId(goalId).stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        return taskRepository.findByUserId(user.getId()).stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskResponse updateTask(String userEmail, Long taskId, UpdateTaskRequest request) {
        User user = getUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not have permission to modify this task");
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        Task updatedTask = taskRepository.save(task);
        updateGoalProgress(task.getGoal());

        return mapToTaskResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(String userEmail, Long taskId) {
        User user = getUserByEmail(userEmail);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not have permission to delete this task");
        }

        Goal goal = task.getGoal();
        taskRepository.delete(task);
        updateGoalProgress(goal);
    }

    private void updateGoalProgress(Goal goal) {
        if (goal == null) return;
        List<Task> tasks = taskRepository.findByGoalId(goal.getId());
        if (tasks.isEmpty()) {
            goal.setProgress(0);
            goal.setIsCompleted(false);
        } else {
            long completedCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
            int progress = (int) Math.round(((double) completedCount / tasks.size()) * 100);
            goal.setProgress(progress);
            goal.setIsCompleted(progress == 100);
        }
        goalRepository.save(goal);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private TaskResponse mapToTaskResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .goalId(task.getGoal() != null ? task.getGoal().getId() : null)
                .goalTitle(task.getGoal() != null ? task.getGoal().getTitle() : null)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}