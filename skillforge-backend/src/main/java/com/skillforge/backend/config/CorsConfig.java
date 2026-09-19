package com.skillforge.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

/**
 * ==============================================================================
 * SKILLFORGE BACKEND - CORS CONFIGURATION (CorsConfig.java)
 * ==============================================================================
 * Configures Cross-Origin Resource Sharing (CORS) for the Spring MVC layer.
 * Allows Vercel production frontend, Render services, local development (Web & Mobile),
 * and dynamic frontend domains supplied via the FRONTEND_URL environment variable.
 * ==============================================================================
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${FRONTEND_URL:}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> allowedOriginPatterns = new ArrayList<>();

        // Local development environments (Web, Expo, Metro)
        allowedOriginPatterns.add("http://localhost:5173");
        allowedOriginPatterns.add("http://localhost:3000");
        allowedOriginPatterns.add("http://localhost:19006");
        allowedOriginPatterns.add("http://127.0.0.1:*");

        // Production Cloud Domains
        allowedOriginPatterns.add("https://*.vercel.app");
        allowedOriginPatterns.add("https://*.render.com");
        allowedOriginPatterns.add("https://*.onrender.com");

        // Optional dynamic frontend URL from environment variable
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            allowedOriginPatterns.add(frontendUrl.trim());
        }

        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOriginPatterns.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
