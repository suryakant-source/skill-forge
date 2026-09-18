package com.skillforge.backend.service.impl;

import com.skillforge.backend.dto.request.UpdateProfileRequest;
import com.skillforge.backend.dto.response.UserResponse;
import com.skillforge.backend.entity.User;
import com.skillforge.backend.entity.UserSkill;
import com.skillforge.backend.exception.ResourceNotFoundException;
import com.skillforge.backend.repository.UserRepository;
import com.skillforge.backend.repository.UserSkillRepository;
import com.skillforge.backend.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;

    public UserServiceImpl(UserRepository userRepository, UserSkillRepository userSkillRepository) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
    }

    @Override
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

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

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
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