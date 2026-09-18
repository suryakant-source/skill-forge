package com.skillforge.backend.dto.response;

import com.skillforge.backend.enums.ExperienceLevel;
import com.skillforge.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Safe user profile response excluding sensitive credentials.
 * Skills are returned as SkillResponse objects (with id + skillName)
 * so the frontend can delete individual skills by their database ID.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String bio;
    private String careerGoal;
    private ExperienceLevel experienceLevel;
    private Role role;

    /** Skills with ID + name so frontend can call DELETE /api/users/skills/{id} */
    private List<SkillResponse> skills;

    private Boolean isActive;
    private LocalDateTime createdAt;
}