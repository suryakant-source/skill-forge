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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of TaskService managing tasks and recalculating goal progress.
 */
@Service
public class TaskServiceImpl implements TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskServiceImpl.class);

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
    public TaskResponse createTask(Long userId, Long goalId, CreateTaskRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return executeCreateTask(user, goalId, request);
    }

    @Override
    @Transactional
    public TaskResponse createTask(String email, Long goalId, CreateTaskRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return executeCreateTask(user, goalId, request);
    }

    private TaskResponse executeCreateTask(User user, Long goalId, CreateTaskRequest request) {
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

        Task saved = taskRepository.save(task);
        recalculateGoalProgress(goal);
        log.info("Created task ID: {} under goal ID: {}", saved.getId(), goalId);

        return mapToTaskResponse(saved);
    }

    @Override
    public List<TaskResponse> getTasksByGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not own this goal");
        }

        return taskRepository.findByGoalId(goalId).stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByGoal(String email, Long goalId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return getTasksByGoal(user.getId(), goalId);
    }

    @Override
    public List<TaskResponse> getTasksByUser(Long userId) {
        return taskRepository.findByUserId(userId).stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return getTasksByUser(user.getId());
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long userId, Long taskId, UpdateTaskRequest request) {
        Task task = getTaskAndVerifyOwnership(taskId, userId);

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        Task saved = taskRepository.save(task);
        recalculateGoalProgress(task.getGoal());
        return mapToTaskResponse(saved);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(String email, Long taskId, UpdateTaskRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return updateTask(user.getId(), taskId, request);
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(Long userId, Long taskId, TaskStatus status) {
        Task task = getTaskAndVerifyOwnership(taskId, userId);
        task.setStatus(status);
        Task saved = taskRepository.save(task);
        recalculateGoalProgress(task.getGoal());
        log.info("Task ID {} status updated to: {}", taskId, status);
        return mapToTaskResponse(saved);
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(String email, Long taskId, TaskStatus status) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return updateTaskStatus(user.getId(), taskId, status);
    }

    @Override
    @Transactional
    public void deleteTask(Long userId, Long taskId) {
        Task task = getTaskAndVerifyOwnership(taskId, userId);
        Goal goal = task.getGoal();
        taskRepository.delete(task);
        recalculateGoalProgress(goal);
        log.info("Deleted task ID: {}", taskId);
    }

    @Override
    @Transactional
    public void deleteTask(String email, Long taskId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        deleteTask(user.getId(), taskId);
    }

    private void recalculateGoalProgress(Goal goal) {
        if (goal == null) return;
        List<Task> tasks = taskRepository.findByGoalId(goal.getId());
        if (tasks.isEmpty()) {
            goal.setProgress(0);
            goal.setIsCompleted(false);
        } else {
            long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
            int progress = (int) Math.round(((double) completed / tasks.size()) * 100);
            goal.setProgress(progress);
            goal.setIsCompleted(progress >= 100);
        }
        goalRepository.save(goal);
    }

    private Task getTaskAndVerifyOwnership(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        if (!task.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to modify this task");
        }
        return task;
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