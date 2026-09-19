# ==============================================================================
# SKILLFORGE BACKEND - PRODUCTION MULTI-STAGE DOCKERFILE
# ==============================================================================
# Multi-stage build minimizes final image size, separates compile-time dependencies
# (Maven, JDK tools) from runtime environment, and prevents source code leakage.
#
# Stage 1: Build Stage (~800MB) -> Compiles Java source and packages executable JAR
# Stage 2: Runtime Stage (~150MB) -> Lightweight Alpine JRE containing only the JAR
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Build & Package Application
# ------------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set working directory inside build container
WORKDIR /app

# Step 1: Copy only pom.xml first to leverage Docker layer caching for dependencies
COPY pom.xml .

# Download dependencies offline (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Step 2: Copy application source code
COPY src ./src

# Step 3: Compile and build the executable JAR (skipping tests for fast cloud deployment)
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------
# STAGE 2: Lightweight Alpine JRE Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine

# Set working directory for runtime container
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Cloud platform documentation (Render will map this to the host port via $PORT)
EXPOSE 8080

# Run Spring Boot with 'prod' profile active
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
