@echo off
title SkillForge - Automated Environment Setup
color 0A

echo ========================================================
echo       SKILLFORGE 1-CLICK SYSTEM SETUP & INSTALLER       
echo ========================================================
echo.

:: 1. FIX JAVA_HOME
echo [1/4] Configuring JAVA_HOME...
set "JDK_PATH=C:\Users\ASUS\AppData\Roaming\Antigravity\User\globalStorage\pleiades.java-extension-pack-jdk\java\latest"
if exist "%JDK_PATH%\bin\java.exe" (
    setx JAVA_HOME "%JDK_PATH%" >nul
    set "JAVA_HOME=%JDK_PATH%"
    set "PATH=%JDK_PATH%\bin;%PATH%"
    echo   [OK] JAVA_HOME set to: %JDK_PATH%
) else (
    echo   [!] JDK not found at default location.
)

:: 2. VERIFY JAVA & MAVEN
echo.
echo [2/4] Verifying Java and Maven...
java -version
echo.
mvn -version

:: 3. INSTALL POSTGRESQL (IF MISSING)
echo.
echo [3/4] Checking PostgreSQL...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   [i] PostgreSQL not found. Installing via winget to D:\PostgreSQL...
    winget install --id PostgreSQL.PostgreSQL.16 -e --location "D:\PostgreSQL" --silent --accept-package-agreements --accept-source-agreements
    set "PATH=D:\PostgreSQL\bin;C:\Program Files\PostgreSQL\16\bin;%PATH%"
) else (
    echo   [OK] PostgreSQL already installed.
)

:: 4. SETUP DATABASE AND USER
echo.
echo [4/4] Setting up skillforge_db and skillforge_user...
set "PGPASSWORD=postgres"

psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE skillforge_db;" 2>nul
psql -U postgres -h localhost -p 5432 -c "CREATE USER skillforge_user WITH PASSWORD 'skillforge@123';" 2>nul
psql -U postgres -h localhost -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE skillforge_db TO skillforge_user;" 2>nul
psql -U postgres -h localhost -p 5432 -d skillforge_db -c "GRANT ALL ON SCHEMA public TO skillforge_user;" 2>nul

echo.
echo Testing connection with new user...
set "PGPASSWORD=skillforge@123"
psql -U skillforge_user -h localhost -p 5432 -d skillforge_db -c "SELECT current_user, current_database();"

echo.
echo ========================================================
echo                 SETUP PROCESS COMPLETED                 
echo ========================================================
pause
