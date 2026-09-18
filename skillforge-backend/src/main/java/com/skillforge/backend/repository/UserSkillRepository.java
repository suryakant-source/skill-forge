package com.skillforge.backend.repository;

import com.skillforge.backend.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for UserSkill entity database operations.
 */
@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    /**
     * Fetch all skills associated with a specific user.
     *
     * @param userId User's ID
     * @return List of skills for the user
     */
    List<UserSkill> findByUserId(Long userId);

    /**
     * Check if a skill with the given name already exists for a user.
     * Prevents duplicate skills on the user's profile.
     *
     * @param userId User's ID
     * @param skillName Name of the skill
     * @return true if the skill exists, false otherwise
     */
    boolean existsByUserIdAndSkillName(Long userId, String skillName);

    /**
     * Delete a specific skill belonging to a user by skill ID.
     *
     * @param userId User's ID
     * @param id Skill's ID
     */
    void deleteByUserIdAndId(Long userId, Long id);
}