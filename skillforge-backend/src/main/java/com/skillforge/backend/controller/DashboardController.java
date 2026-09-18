package com.skillforge.backend.controller;

import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.dto.response.DashboardResponse;
import com.skillforge.backend.service.DashboardService;
import com.skillforge.backend.util.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for retrieving aggregated user metrics and progress analytics.
 * Base URL: /api/dashboard
 * PROTECTED
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);

    private final DashboardService dashboardService;
    private final SecurityUtils securityUtils;

    public DashboardController(DashboardService dashboardService, SecurityUtils securityUtils) {
        this.dashboardService = dashboardService;
        this.securityUtils = securityUtils;
    }

    /**
     * Get aggregated stats for the dashboard.
     * GET /api/dashboard/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardStats() {
        Long userId = securityUtils.getCurrentUserId();
        log.info("Endpoint called: GET /api/dashboard/stats for userId: {}", userId);
        DashboardResponse response = dashboardService.getDashboardStats(userId);
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics fetched successfully", response));
    }

    /**
     * Compatibility alias for GET /api/dashboard
     */
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return getDashboardStats();
    }
}