package com.skillforge.backend.service;

import com.skillforge.backend.dto.request.AIQueryRequest;
import com.skillforge.backend.dto.response.AIResponse;

/**
 * Service interface for AI-powered personalized career and learning path recommendations.
 */
public interface AIService {
    AIResponse getRecommendation(Long userId, AIQueryRequest request);
    AIResponse getRecommendation(String email, AIQueryRequest request);
}