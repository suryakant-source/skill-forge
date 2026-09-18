package com.skillforge.backend.controller;

import com.skillforge.backend.dto.request.AIQueryRequest;
import com.skillforge.backend.dto.response.AIResponse;
import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.service.AIService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<AIResponse>> getRecommendation(
            Authentication authentication,
            @Valid @RequestBody AIQueryRequest request
    ) {
        AIResponse response = aiService.getRecommendation(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("AI recommendation generated successfully", response));
    }
}