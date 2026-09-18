package com.skillforge.backend.repository;

import com.skillforge.backend.entity.Goal;
import com.skillforge.backend.enums.GoalCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Goal entity database operations.
 */
@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    /**
     * Fetch all learning and career goals belonging to a specific user.
     *
     * @param userId User's ID
     * @return List of goals for the user
     */
    List<Goal> findByUserId(Long userId);

    /**
     * Filter a user's goals by their completion status (completed or pending).
     *
     * @param userId User's ID
     * @param isCompleted Completion flag
     * @return List of matched goals
     */
    List<Goal> findByUserIdAndIsCompleted(Long userId, Boolean isCompleted);

    /**
     * Filter a user's goals by category (e.g. FRONTEND, BACKEND, AI_ML).
     *
     * @param userId User's ID
     * @param category Goal category enum
     * @return List of matched goals
     */
    List<Goal> findByUserIdAndCategory(Long userId, GoalCategory category);

    /**
     * Count total goals created by a user.
     * Used for dashboard analytics and progress tracking.
     *
     * @param userId User's ID
     * @return Total count of goals
     */
    Long countByUserId(Long userId);

    /**
     * Count goals for a user filtered by completion status.
     *
     * @param userId User's ID
     * @param isCompleted Completion status
     * @return Count of matching goals
     */
    Long countByUserIdAndIsCompleted(Long userId, Boolean isCompleted);
}