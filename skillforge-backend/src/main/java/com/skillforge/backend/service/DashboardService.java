package com.skillforge.backend.service;

import com.skillforge.backend.dto.response.DashboardResponse;

/**
 * Service interface for calculating aggregated user dashboard analytics.
 */
public interface DashboardService {
    DashboardResponse getDashboardStats(Long userId);
    DashboardResponse getDashboardStats(String email);
    default DashboardResponse getDashboardMetrics(String email) {
        return getDashboardStats(email);
    }
}