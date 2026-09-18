package com.skillforge.backend.service;

import com.skillforge.backend.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboardMetrics(String userEmail);
}