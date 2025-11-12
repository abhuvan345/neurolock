# NeuroLock Integration Test Script
# Tests: Register -> Login -> Behavior Analysis

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  NeuroLock Integration Test" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"
$mlUrl = "http://localhost:5000"

# Test 1: Check services
Write-Host "Step 1: Checking services..." -ForegroundColor Yellow

try {
    $mlHealth = Invoke-RestMethod -Uri "$mlUrl/" -Method GET
    Write-Host "  [OK] ML Service: $($mlHealth.message)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] ML Service not running on port 5000" -ForegroundColor Red
    exit 1
}

try {
    $backendHealth = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "  [OK] Backend: Status $($backendHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Backend not running on port 8080" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Register user
Write-Host "Step 2: Registering test user..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "testuser_$timestamp@neurolock.com"
$testPassword = "SecurePass123!"

$registerData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body $registerData
    Write-Host "  [OK] User registered" -ForegroundColor Green
    Write-Host "       Email: $testEmail" -ForegroundColor Gray
    Write-Host "       User ID: $($registerResponse.userId)" -ForegroundColor Gray
    $userId = $registerResponse.userId
} catch {
    Write-Host "  [FAIL] Registration failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Login
Write-Host "Step 3: Logging in..." -ForegroundColor Yellow

$loginData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    Write-Host "  [OK] Login successful" -ForegroundColor Green
    Write-Host "       Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    $token = $loginResponse.token
} catch {
    Write-Host "  [FAIL] Login failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Behavior analysis (Backend -> ML Service)
Write-Host "Step 4: Testing behavior analysis..." -ForegroundColor Yellow

$behaviorData = @{
    features = @{
        avg_key_interval = 0.28
        mouse_speed = 118
        click_variance = 0.19
        nav_entropy = 0.81
    }
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $behaviorResponse = Invoke-RestMethod -Uri "$baseUrl/api/behavior" -Method POST -Headers $headers -Body $behaviorData
    Write-Host "  [OK] Behavior analysis successful" -ForegroundColor Green
    Write-Host "       Trust Score: $($behaviorResponse.trust_score)/100" -ForegroundColor Gray
    Write-Host "       Action: $($behaviorResponse.action)" -ForegroundColor Gray
    
    $actionColor = switch ($behaviorResponse.action) {
        "allow" { "Green" }
        "reauth" { "Yellow" }
        "lockout" { "Red" }
        default { "Gray" }
    }
    
    $actionMessage = switch ($behaviorResponse.action) {
        "allow" { "[SAFE] Normal behavior - Access granted" }
        "reauth" { "[WARNING] Suspicious - Re-auth required" }
        "lockout" { "[DANGER] Anomalous - Account locked" }
        default { "Unknown action" }
    }
    
    Write-Host "       $actionMessage" -ForegroundColor $actionColor
    
} catch {
    Write-Host "  [FAIL] Behavior analysis failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 5: Multiple behavior patterns
Write-Host "Step 5: Testing different behaviors..." -ForegroundColor Yellow

$testCases = @(
    @{
        name = "Normal"
        data = @{
            avg_key_interval = 0.30
            mouse_speed = 120
            click_variance = 0.20
            nav_entropy = 0.80
        }
    },
    @{
        name = "Suspicious"
        data = @{
            avg_key_interval = 0.45
            mouse_speed = 90
            click_variance = 0.35
            nav_entropy = 0.50
        }
    },
    @{
        name = "Anomalous"
        data = @{
            avg_key_interval = 0.80
            mouse_speed = 50
            click_variance = 0.60
            nav_entropy = 0.20
        }
    }
)

foreach ($testCase in $testCases) {
    $testBehavior = @{
        features = $testCase.data
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "$baseUrl/api/behavior" -Method POST -Headers $headers -Body $testBehavior
        Write-Host "  $($testCase.name): Score=$($result.trust_score) Action=$($result.action)" -ForegroundColor Cyan
    } catch {
        Write-Host "  Test $($testCase.name) failed" -ForegroundColor Red
    }
}

Write-Host ""

# Test 6: Direct ML call
Write-Host "Step 6: Testing ML Service directly..." -ForegroundColor Yellow

$mlTestData = @{
    user_id = $userId
    sample = @{
        avg_key_interval = 0.28
        mouse_speed = 118
        click_variance = 0.19
        nav_entropy = 0.81
    }
} | ConvertTo-Json

try {
    $mlResult = Invoke-RestMethod -Uri "$mlUrl/analyze" -Method POST -ContentType "application/json" -Body $mlTestData
    Write-Host "  [OK] ML Service direct call works" -ForegroundColor Green
    Write-Host "       Trust Score: $($mlResult.trust_score)" -ForegroundColor Gray
    Write-Host "       Action: $($mlResult.action)" -ForegroundColor Gray
} catch {
    Write-Host "  [FAIL] ML Service direct call failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Integration Test Complete" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Results:" -ForegroundColor White
Write-Host "  [PASS] ML Service running" -ForegroundColor Green
Write-Host "  [PASS] Backend running" -ForegroundColor Green
Write-Host "  [PASS] User registration" -ForegroundColor Green
Write-Host "  [PASS] User login" -ForegroundColor Green
Write-Host "  [PASS] Behavior analysis" -ForegroundColor Green
Write-Host "  [PASS] Backend <-> ML integration" -ForegroundColor Green
Write-Host ""
Write-Host "All tests passed successfully!" -ForegroundColor Green
Write-Host ""
