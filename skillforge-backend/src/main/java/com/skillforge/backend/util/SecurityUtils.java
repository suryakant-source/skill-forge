package com.skillforge.backend.util;

import com.skillforge.backend.entity.User;
import com.skillforge.backend.exception.UnauthorizedException;
import com.skillforge.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utility component to extract the authenticated user ID and email securely
 * from the Spring SecurityContextHolder.
 */
@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Extracts current user ID from the active JWT authentication token.
     *
     * @return Long database user ID
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found in database"));
    }

    /**
     * Extracts current user email from the active JWT authentication token.
     *
     * @return String email address
     */
    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return authentication.getName();
    }
}