package com.skillforge.backend.repository;

import com.skillforge.backend.entity.Task;
import com.skillforge.backend.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Task entity database operations.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Fetch all tasks associated with a specific goal.
     *
     * @param goalId Goal's ID
     * @return List of tasks under the goal
     */
    List<Task> findByGoalId(Long goalId);

    /**
     * Fetch all tasks belonging to a specific user.
     *
     * @param userId User's ID
     * @return List of tasks created by the user
     */
    List<Task> findByUserId(Long userId);

    /**
     * Filter tasks of a specific goal by status (PENDING, IN_PROGRESS, COMPLETED).
     *
     * @param goalId Goal's ID
     * @param status TaskStatus enum
     * @return List of matched tasks
     */
    List<Task> findByGoalIdAndStatus(Long goalId, TaskStatus status);

    /**
     * Count total tasks assigned to/created by a user.
     *
     * @param userId User's ID
     * @return Total task count
     */
    Long countByUserId(Long userId);

    /**
     * Count a user's tasks by status (e.g., how many COMPLETED, PENDING).
     *
     * @param userId User's ID
     * @param status TaskStatus enum
     * @return Count of tasks with the given status
     */
    Long countByUserIdAndStatus(Long userId, TaskStatus status);

    /**
     * Fetch a user's tasks by status (e.g., all COMPLETED tasks for dashboard).
     *
     * @param userId User's ID
     * @param status TaskStatus enum
     * @return List of matching tasks
     */
    List<Task> findByUserIdAndStatus(Long userId, TaskStatus status);
}