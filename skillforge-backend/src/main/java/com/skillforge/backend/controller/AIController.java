package com.skillforge.backend.controller;

import com.skillforge.backend.dto.request.AIQueryRequest;
import com.skillforge.backend.dto.response.AIResponse;
import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.service.AIService;
import com.skillforge.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for AI Career & Learning Path Guidance.
 * Base URL: /api/ai
 * PROTECTED
 */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);

    private final AIService aiService;
    private final SecurityUtils securityUtils;

    public AIController(AIService aiService, SecurityUtils securityUtils) {
        this.aiService = aiService;
        this.securityUtils = securityUtils;
    }

    /**
     * Generate customized AI recommendation based on current user profile and goals.
     * POST /api/ai/recommend
     */
    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<AIResponse>> getRecommendation(@Valid @RequestBody AIQueryRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: POST /api/ai/recommend for userId: {}", userId);
        AIResponse response = aiService.getRecommendation(userId, request);
        return ResponseEntity.ok(ApiResponse.success("AI recommendation generated successfully", response));
    }
}