package com.skillforge.backend.repository;

import com.skillforge.backend.entity.User;
import com.skillforge.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity database operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their unique email address.
     * Used during authentication / login.
     *
     * @param email User's email
     * @return Optional containing the User if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user with the given email already exists.
     * Used during registration to prevent duplicate accounts.
     *
     * @param email User's email
     * @return true if email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Fetch all active users.
     * Used for administration and user management.
     *
     * @return List of active users
     */
    List<User> findByIsActiveTrue();

    /**
     * Filter users by their assigned role (USER, ADMIN).
     *
     * @param role Target role
     * @return List of users with the specified role
     */
    List<User> findByRole(Role role);
}