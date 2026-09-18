package com.skillforge.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response payload containing AI-generated learning plans and career guidance.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIResponse {

    private String currentLevel;
    private List<String> skillGaps;
    private List<String> recommendedTopics;
    private String weeklyPlan;
    private List<String> suggestedProjects;
    private String estimatedTimeline;
    private String rawResponse;
}