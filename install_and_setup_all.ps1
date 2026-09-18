# SkillForge Automated System Setup
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       SKILLFORGE 1-CLICK SYSTEM SETUP & INSTALLER       " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. FIX JAVA_HOME
Write-Host "`n[1/4] Configuring JAVA_HOME..." -ForegroundColor Yellow
$jdkPath = "C:\Users\ASUS\AppData\Roaming\Antigravity\User\globalStorage\pleiades.java-extension-pack-jdk\java\latest"
if (Test-Path "$jdkPath\bin\java.exe") {
    [System.Environment]::SetEnvironmentVariable('JAVA_HOME', $jdkPath, 'User')
    $env:JAVA_HOME = $jdkPath
    $env:PATH = "$jdkPath\bin;" + $env:PATH
    Write-Host "  [OK] JAVA_HOME set to: $jdkPath" -ForegroundColor Green
} else {
    Write-Host "  [!] JDK not found at default location." -ForegroundColor Red
}

# 2. VERIFY JAVA & MAVEN
Write-Host "`n[2/4] Verifying Java and Maven..." -ForegroundColor Yellow
& java -version
Write-Host ""
& mvn -version

# 3. POSTGRESQL CHECK & INSTALL
Write-Host "`n[3/4] Checking PostgreSQL..." -ForegroundColor Yellow
$psql = (Get-Command psql -ErrorAction SilentlyContinue)
if (-not $psql) {
    Write-Host "  PostgreSQL missing. Installing to D:\PostgreSQL via winget..." -ForegroundColor Cyan
    winget install --id PostgreSQL.PostgreSQL.16 -e --location "D:\PostgreSQL" --silent --accept-package-agreements --accept-source-agreements
    $env:PATH = "D:\PostgreSQL\bin;C:\Program Files\PostgreSQL\16\bin;" + $env:PATH
} else {
    Write-Host "  [OK] PostgreSQL found at: $($psql.Source)" -ForegroundColor Green
}

# 4. DATABASE & USER SETUP
Write-Host "`n[4/4] Setting up skillforge_db and skillforge_user..." -ForegroundColor Yellow
$env:PGPASSWORD = "postgres"
& psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE skillforge_db;" 2>$null
& psql -U postgres -h localhost -p 5432 -c "CREATE USER skillforge_user WITH PASSWORD 'skillforge@123';" 2>$null
& psql -U postgres -h localhost -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE skillforge_db TO skillforge_user;" 2>$null
& psql -U postgres -h localhost -p 5432 -d skillforge_db -c "GRANT ALL ON SCHEMA public TO skillforge_user;" 2>$null

Write-Host "`nTesting connection with skillforge_user..." -ForegroundColor Yellow
$env:PGPASSWORD = "skillforge@123"
& psql -U skillforge_user -h localhost -p 5432 -d skillforge_db -c "SELECT current_user, current_database();"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "                 SETUP COMPLETED!                       " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
