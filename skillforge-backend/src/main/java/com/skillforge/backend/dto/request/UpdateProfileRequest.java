package com.skillforge.backend.dto.request;

import com.skillforge.backend.enums.ExperienceLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for updating user profile information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    @Size(max = 200, message = "Career goal must not exceed 200 characters")
    private String careerGoal;

    private ExperienceLevel experienceLevel;
}