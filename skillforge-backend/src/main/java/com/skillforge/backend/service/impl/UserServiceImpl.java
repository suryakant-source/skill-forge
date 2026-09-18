package com.skillforge.backend.service.impl;

import com.skillforge.backend.dto.request.UpdateProfileRequest;
import com.skillforge.backend.dto.response.UserResponse;
import com.skillforge.backend.entity.User;
import com.skillforge.backend.entity.UserSkill;
import com.skillforge.backend.exception.BadRequestException;
import com.skillforge.backend.exception.ResourceNotFoundException;
import com.skillforge.backend.exception.UnauthorizedException;
import com.skillforge.backend.repository.UserRepository;
import com.skillforge.backend.repository.UserSkillRepository;
import com.skillforge.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of UserService managing profiles, user skills, and account lifecycle.
 */
@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;

    public UserServiceImpl(UserRepository userRepository, UserSkillRepository userSkillRepository) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
    }

    @Override
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return applyProfileUpdates(user, request);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return applyProfileUpdates(user, request);
    }

    private UserResponse applyProfileUpdates(User user, UpdateProfileRequest request) {
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getCareerGoal() != null) {
            user.setCareerGoal(request.getCareerGoal());
        }
        if (request.getExperienceLevel() != null) {
            user.setExperienceLevel(request.getExperienceLevel());
        }

        User updated = userRepository.save(user);
        log.info("Profile updated for user ID: {}", user.getId());
        return mapToUserResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse addSkill(Long userId, String skillName) {
        if (skillName == null || skillName.trim().isEmpty()) {
            throw new BadRequestException("Skill name cannot be blank");
        }
        String cleanSkill = skillName.trim();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (userSkillRepository.existsByUserIdAndSkillName(userId, cleanSkill)) {
            throw new BadRequestException("Skill '" + cleanSkill + "' is already added to profile");
        }

        UserSkill skill = UserSkill.builder()
                .user(user)
                .skillName(cleanSkill)
                .build();
        userSkillRepository.save(skill);
        log.info("Added skill '{}' for user ID: {}", cleanSkill, userId);

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public void removeSkill(Long userId, Long skillId) {
        UserSkill skill = userSkillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + skillId));

        if (!skill.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to delete this skill");
        }

        userSkillRepository.delete(skill);
        log.info("Removed skill ID {} for user ID: {}", skillId, userId);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User account deactivated for ID: {}", userId);
    }

    private UserResponse mapToUserResponse(User user) {
        List<String> skills = userSkillRepository.findByUserId(user.getId()).stream()
                .map(UserSkill::getSkillName)
                .collect(Collectors.toList());

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .careerGoal(user.getCareerGoal())
                .experienceLevel(user.getExperienceLevel())
                .role(user.getRole())
                .skills(skills)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}