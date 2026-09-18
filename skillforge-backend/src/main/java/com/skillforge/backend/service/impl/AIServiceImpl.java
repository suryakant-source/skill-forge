package com.skillforge.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.backend.dto.request.AIQueryRequest;
import com.skillforge.backend.dto.response.AIResponse;
import com.skillforge.backend.entity.Goal;
import com.skillforge.backend.entity.Task;
import com.skillforge.backend.entity.User;
import com.skillforge.backend.entity.UserSkill;
import com.skillforge.backend.enums.TaskStatus;
import com.skillforge.backend.exception.ResourceNotFoundException;
import com.skillforge.backend.repository.GoalRepository;
import com.skillforge.backend.repository.TaskRepository;
import com.skillforge.backend.repository.UserRepository;
import com.skillforge.backend.repository.UserSkillRepository;
import com.skillforge.backend.service.AIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * ============================================================================
 * AIServiceImpl — Groq Cloud AI Integration for SkillForge Career Mentoring
 * ============================================================================
 *
 * GROQ API CONTRACT:
 * ─────────────────
 * Endpoint:  POST https://api.groq.com/openai/v1/chat/completions
 * Auth:      Authorization: Bearer gsk_xxxxx
 * Model:     llama-3.3-70b-versatile  (70B params, LPU™ inference, ~0.8s latency)
 *
 * REQUEST BODY (OpenAI-compatible format):
 * {
 *   "model": "llama-3.3-70b-versatile",
 *   "messages": [
 *     { "role": "system", "content": "You are SkillForge AI Career Mentor..." },
 *     { "role": "user",   "content": "User context + query..." }
 *   ],
 *   "temperature": 0.4,               // Lower = more focused/deterministic output
 *   "response_format": { "type": "json_object" }  // Forces clean JSON — no markdown noise
 * }
 *
 * RESPONSE STRUCTURE:
 * {
 *   "choices": [{
 *     "message": {
 *       "role": "assistant",
 *       "content": "{ \"currentLevel\": \"...\", \"skillGaps\": [...], ... }"
 *     }
 *   }]
 * }
 *
 * JSON SCHEMA we instruct the model to return (AIResponse fields):
 * {
 *   "currentLevel":       "string — concise level description",
 *   "skillGaps":          ["string", ...] — list of missing skills,
 *   "recommendedTopics":  ["string", ...] — topics to study next,
 *   "weeklyPlan":         "string — formatted week-by-week schedule",
 *   "suggestedProjects":  ["string", ...] — portfolio project ideas,
 *   "estimatedTimeline":  "string — weeks/months estimate"
 * }
 *
 * FALLBACK STRATEGY:
 * If Groq API call fails (network error, invalid key, rate limit),
 * createPersonalizedFallback() returns a structured AIResponse built from
 * user's DB data — the UI never crashes or shows a blank screen.
 * ============================================================================
 */
@Service
public class AIServiceImpl implements AIService {

    private static final Logger log = LoggerFactory.getLogger(AIServiceImpl.class);

    // ── Groq config injected from application.properties ─────────────────────
    @Value("${app.groq.api-key}")
    private String groqApiKey;

    @Value("${app.groq.api-url}")
    private String groqApiUrl;

    @Value("${app.groq.model}")
    private String groqModel;

    // ── Repositories ──────────────────────────────────────────────────────────
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;
    private final UserSkillRepository userSkillRepository;

    // ── HTTP client + JSON parser (Spring beans from AppConfig/auto-config) ───
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AIServiceImpl(
            UserRepository userRepository,
            GoalRepository goalRepository,
            TaskRepository taskRepository,
            UserSkillRepository userSkillRepository,
            RestTemplate restTemplate,
            ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
        this.userSkillRepository = userSkillRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API: Overloads for ID-based and email-based lookup
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public AIResponse getRecommendation(Long userId, AIQueryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return generateRecommendation(user, request);
    }

    @Override
    public AIResponse getRecommendation(String email, AIQueryRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return generateRecommendation(user, request);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Core pipeline: Collect context → Build prompt → Call Groq → Parse JSON
    // ─────────────────────────────────────────────────────────────────────────

    private AIResponse generateRecommendation(User user, AIQueryRequest request) {
        Long userId = user.getId();
        log.info("Generating Groq AI recommendation for user: {} ({})", user.getName(), user.getEmail());

        // ── Step 1: Collect user context from DB ─────────────────────────────
        List<String> skills = userSkillRepository.findByUserId(userId).stream()
                .map(UserSkill::getSkillName)
                .collect(Collectors.toList());

        List<Goal> goals = goalRepository.findByUserId(userId);
        List<Task> completedTasks = taskRepository.findByUserIdAndStatus(userId, TaskStatus.COMPLETED);

        // ── Step 2: Attempt Groq Cloud API call ──────────────────────────────
        try {
            return callGroqApi(user, skills, goals, completedTasks, request.getQuery());
        } catch (Exception e) {
            // ── Fallback: structured response built from DB data ──────────────
            // This ensures the UI always gets a valid AIResponse, even if Groq
            // is temporarily unavailable, the API key is invalid, or we're rate-limited.
            log.error("Groq API call failed ({}), returning personalized fallback response.", e.getMessage());
            return createPersonalizedFallback(user, skills, goals);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Groq API: Build payload, call REST endpoint, parse JSON response
    // ─────────────────────────────────────────────────────────────────────────

    private AIResponse callGroqApi(
            User user,
            List<String> skills,
            List<Goal> goals,
            List<Task> completedTasks,
            String userQuery
    ) throws Exception {

        // ── 2a: System prompt — instructs Groq to return strict JSON ─────────
        //
        // WHY json_object format?
        //   Without it, the model wraps JSON in ```json ... ``` markdown blocks
        //   and sometimes adds prose. With response_format: json_object, Groq
        //   guarantees the entire response is a valid JSON string we can parse
        //   directly with ObjectMapper.
        String systemPrompt =
            "You are SkillForge AI Career Mentor — an expert software engineering career coach. " +
            "You specialize in Java, Spring Boot, React, cloud architecture, and full-stack development. " +
            "Return ONLY a valid JSON object matching EXACTLY this schema (no extra text, no markdown):\n" +
            "{\n" +
            "  \"currentLevel\": \"<concise 1-2 sentence assessment of the user's current level and readiness>\",\n" +
            "  \"skillGaps\": [\"<specific missing skill 1>\", \"<specific missing skill 2>\", ...],\n" +
            "  \"recommendedTopics\": [\"<concrete topic to study 1>\", \"<concrete topic to study 2>\", ...],\n" +
            "  \"weeklyPlan\": \"<week-by-week structured learning plan, use \\\\n for line breaks>\",\n" +
            "  \"suggestedProjects\": [\"<portfolio project idea 1>\", \"<portfolio project idea 2>\", ...],\n" +
            "  \"estimatedTimeline\": \"<realistic time estimate, e.g. '6-8 weeks with 2 hrs/day'>\"\n" +
            "}\n" +
            "Provide highly specific, actionable advice tailored to the user's exact profile. " +
            "Lists must have 4-6 items each. weeklyPlan should cover at least 4 weeks.";

        // ── 2b: User prompt — contains all personal context from DB ──────────
        StringBuilder userPromptBuilder = new StringBuilder();
        userPromptBuilder.append("MY PROFILE:\n");
        userPromptBuilder.append("- Name: ").append(user.getName()).append("\n");
        userPromptBuilder.append("- Experience Level: ").append(
                user.getExperienceLevel() != null ? user.getExperienceLevel().name() : "BEGINNER"
        ).append("\n");
        userPromptBuilder.append("- Career Goal: ").append(
                user.getCareerGoal() != null ? user.getCareerGoal() : "Full Stack Software Engineer"
        ).append("\n");
        userPromptBuilder.append("- Current Skills: ").append(
                skills.isEmpty() ? "None specified yet" : String.join(", ", skills)
        ).append("\n");

        userPromptBuilder.append("\nACTIVE LEARNING GOALS:\n");
        if (goals.isEmpty()) {
            userPromptBuilder.append("- No active goals set\n");
        } else {
            for (Goal g : goals) {
                userPromptBuilder.append("- ").append(g.getTitle())
                        .append(" (").append(g.getProgress()).append("% complete)\n");
            }
        }

        userPromptBuilder.append("\nCOMPLETED TASKS: ").append(completedTasks.size()).append(" tasks done.\n");
        userPromptBuilder.append("\nMY QUESTION:\n").append(userQuery);

        String userPrompt = userPromptBuilder.toString();

        // ── 2c: Build Groq request body (OpenAI chat completions format) ──────
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", groqModel);   // e.g., "llama-3.3-70b-versatile"
        requestBody.put("temperature", 0.4);   // balanced: creative but focused

        // response_format: json_object forces the model to output pure JSON
        Map<String, String> responseFormat = new HashMap<>();
        responseFormat.put("type", "json_object");
        requestBody.put("response_format", responseFormat);

        // messages array: system (role) + user (context + query)
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userPrompt));
        requestBody.put("messages", messages);

        // ── 2d: HTTP headers — Content-Type + Bearer token auth ──────────────
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + groqApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // ── 2e: POST to Groq Cloud API ────────────────────────────────────────
        log.info("Calling Groq Cloud API: model={}, endpoint={}", groqModel, groqApiUrl);
        ResponseEntity<String> response = restTemplate.postForEntity(groqApiUrl, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Groq API returned non-2xx status: " + response.getStatusCode());
        }

        // ── 2f: Parse Groq response: choices[0].message.content → JSON ───────
        //
        // Groq response shape:
        // { "choices": [{ "message": { "role": "assistant", "content": "{...json...}" } }] }
        //
        // content is the raw JSON string matching our AIResponse schema.
        // We parse it with ObjectMapper into an AIResponse POJO.
        JsonNode root = objectMapper.readTree(response.getBody());
        String contentJson = root
                .path("choices")
                .get(0)
                .path("message")
                .path("content")
                .asText("");

        if (contentJson.isEmpty()) {
            throw new RuntimeException("Groq returned empty content in choices[0].message.content");
        }

        log.info("Groq response received ({} chars). Parsing JSON...", contentJson.length());

        // Parse the JSON string into our AIResponse DTO
        JsonNode aiJson = objectMapper.readTree(contentJson);

        // Extract lists (Groq returns them as JSON arrays)
        List<String> skillGaps = new ArrayList<>();
        aiJson.path("skillGaps").forEach(node -> skillGaps.add(node.asText()));

        List<String> recommendedTopics = new ArrayList<>();
        aiJson.path("recommendedTopics").forEach(node -> recommendedTopics.add(node.asText()));

        List<String> suggestedProjects = new ArrayList<>();
        aiJson.path("suggestedProjects").forEach(node -> suggestedProjects.add(node.asText()));

        // Robust weeklyPlan extraction: handle both String or Array of objects/strings
        String weeklyPlanStr;
        JsonNode weeklyPlanNode = aiJson.path("weeklyPlan");
        if (weeklyPlanNode.isArray()) {
            StringBuilder planBuilder = new StringBuilder();
            int weekNum = 1;
            for (JsonNode item : weeklyPlanNode) {
                if (item.isObject()) {
                    String focus = item.path("focus").asText(item.path("topic").asText(item.path("description").asText("")));
                    int w = item.path("week").asInt(weekNum);
                    planBuilder.append("Week ").append(w).append(": ").append(focus).append("\n");
                } else {
                    planBuilder.append(item.asText()).append("\n");
                }
                weekNum++;
            }
            weeklyPlanStr = planBuilder.toString().trim();
        } else {
            weeklyPlanStr = weeklyPlanNode.asText("Week 1: Foundation → Week 2: Core → Week 3: Advanced → Week 4: Projects");
        }

        // Build AIResponse from parsed JSON
        AIResponse result = AIResponse.builder()
                .currentLevel(aiJson.path("currentLevel").asText("Assessment unavailable"))
                .skillGaps(skillGaps.isEmpty()
                        ? List.of("Advanced system design", "Cloud deployment", "Performance optimization")
                        : skillGaps)
                .recommendedTopics(recommendedTopics.isEmpty()
                        ? List.of("Clean Architecture", "Design Patterns", "CI/CD pipelines")
                        : recommendedTopics)
                .weeklyPlan(weeklyPlanStr.isEmpty() ? "Week 1: Foundation → Week 2: Core → Week 3: Advanced → Week 4: Projects" : weeklyPlanStr)
                .suggestedProjects(suggestedProjects.isEmpty()
                        ? List.of("Production API with JWT", "Full-stack CRUD app", "Microservice demo")
                        : suggestedProjects)
                .estimatedTimeline(aiJson.path("estimatedTimeline").asText("6-8 weeks with focused study"))
                .rawResponse(contentJson)
                .build();

        log.info("Groq AI response parsed successfully for user: {}", user.getName());
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fallback: Returns a structured response built entirely from DB data
    // Used when Groq is unavailable — ensures the UI always has content
    // ─────────────────────────────────────────────────────────────────────────

    private AIResponse createPersonalizedFallback(User user, List<String> skills, List<Goal> goals) {
        String level = user.getExperienceLevel() != null ? user.getExperienceLevel().name() : "BEGINNER";
        String target = user.getCareerGoal() != null ? user.getCareerGoal() : "Full Stack Software Engineer";

        log.info("Serving personalized fallback for user: {} targeting: {}", user.getName(), target);

        return AIResponse.builder()
                .currentLevel(level + " engineer with solid foundations, targeting: " + target)
                .skillGaps(List.of(
                        "Microservices Architecture & Service Mesh",
                        "Docker + Kubernetes Container Orchestration",
                        "Kafka Event Streaming & Async Messaging",
                        "CI/CD Pipelines with GitHub Actions",
                        "Redis Caching & Session Management"
                ))
                .recommendedTopics(List.of(
                        "Spring Boot 3 + Java 21 Virtual Threads",
                        "Spring Security 6 with JWT & OAuth2",
                        "PostgreSQL Performance Tuning & Indexing",
                        "React Query + Vite Frontend Architecture",
                        "System Design: Load Balancers, CDN, Databases"
                ))
                .weeklyPlan(
                        "Week 1: Deep dive Spring Data JPA — Repositories, Projections, Auditing\n" +
                        "Week 2: Spring Security 6 — JWT filter chain, BCrypt, Role-based access\n" +
                        "Week 3: REST API contracts, DTO validation, Global exception handling\n" +
                        "Week 4: Docker containerization & docker-compose multi-service setup\n" +
                        "Week 5: Frontend Integration — React Query, Axios, Auth flow\n" +
                        "Week 6: Production deployment — Railway/Render, CI/CD, monitoring"
                )
                .suggestedProjects(List.of(
                        "SkillForge — Production Learning Tracker (this project!)",
                        "E-Commerce Platform with inventory, payments & notifications",
                        "Real-Time Collaboration API with WebSockets + Redis pub/sub",
                        "Microservices demo with API Gateway, service discovery & tracing"
                ))
                .estimatedTimeline("6 - 8 Weeks with 2+ hours/day focused study")
                .rawResponse("Groq AI temporarily unavailable. Personalized roadmap generated for "
                        + user.getName() + " targeting " + target + " from " + level + " level.")
                .build();
    }
}