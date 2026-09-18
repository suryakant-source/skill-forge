package com.skillforge.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload for a user's individual skill entry.
 * Includes the skill ID (needed for deletion) and the skill name (for display).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillResponse {

    /** Database ID of the UserSkill entity — required for DELETE /api/users/skills/{skillId} */
    private Long id;

    /** Human-readable skill name, e.g., "Java", "Spring Boot", "Docker" */
    private String skillName;
}
