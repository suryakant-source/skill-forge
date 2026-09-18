package com.skillforge.backend.controller;

import com.skillforge.backend.dto.response.ApiResponse;
import com.skillforge.backend.dto.response.DashboardResponse;
import com.skillforge.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(Authentication authentication) {
        DashboardResponse response = dashboardService.getDashboardMetrics(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved successfully", response));
    }
}