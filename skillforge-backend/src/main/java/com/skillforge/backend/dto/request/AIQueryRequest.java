package com.skillforge.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for sending career advisory prompts to the AI assistant.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIQueryRequest {

    @NotBlank(message = "Query cannot be blank")
    @Size(max = 1000, message = "Query cannot exceed 1000 characters")
    private String query;
}