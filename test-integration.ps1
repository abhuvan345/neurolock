# NeuroLock Integration Test Script
# This script tests the complete flow: Register → Login → Behavior Analysis

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  🧪 NeuroLock Integration Test" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"
$mlUrl = "http://localhost:5000"

# Test 1: Check services are running
Write-Host "📡 Step 1: Checking if services are running..." -ForegroundColor Yellow

try {
    $mlHealth = Invoke-RestMethod -Uri "$mlUrl/" -Method GET
    Write-Host "  ✅ ML Service: $($mlHealth.message)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ML Service is not running on port 5000" -ForegroundColor Red
    Write-Host "  Run: cd ml_service; python app.py" -ForegroundColor Gray
    exit 1
}

try {
    $backendHealth = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "  ✅ Backend: Status $($backendHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Backend is not running on port 8080" -ForegroundColor Red
    Write-Host "  Run: cd neurolock-backend; node server.js" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Test 2: Register a new user
Write-Host "👤 Step 2: Registering a test user..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "testuser_$timestamp@neurolock.com"
$testPassword = "SecurePass123!"

$registerData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerData
    
    Write-Host "  ✅ User registered successfully" -ForegroundColor Green
    Write-Host "     Email: $testEmail" -ForegroundColor Gray
    Write-Host "     User ID: $($registerResponse.userId)" -ForegroundColor Gray
    $userId = $registerResponse.userId
} catch {
    Write-Host "  ❌ Registration failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Login
Write-Host "🔐 Step 3: Logging in..." -ForegroundColor Yellow

$loginData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData
    
    Write-Host "  ✅ Login successful" -ForegroundColor Green
    Write-Host "     Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    $token = $loginResponse.token
} catch {
    Write-Host "  ❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Send behavior data (Backend to ML Service integration)
Write-Host "🧠 Step 4: Testing behavior analysis (Backend to ML Service)..." -ForegroundColor Yellow

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
    $behaviorResponse = Invoke-RestMethod -Uri "$baseUrl/api/behavior" `
        -Method POST `
        -Headers $headers `
        -Body $behaviorData
    
    Write-Host "  ✅ Behavior analysis successful!" -ForegroundColor Green
    Write-Host "     Trust Score: $($behaviorResponse.trust_score)/100" -ForegroundColor Gray
    Write-Host "     Action: $($behaviorResponse.action)" -ForegroundColor Gray
    
    # Interpret the action
    $actionColor = switch ($behaviorResponse.action) {
        "allow" { "Green" }
        "reauth" { "Yellow" }
        "lockout" { "Red" }
        default { "Gray" }
    }
    
    $actionMessage = switch ($behaviorResponse.action) {
        "allow" { "✅ User behavior is normal - Access granted" }
        "reauth" { "⚠️ Suspicious behavior detected - Re-authentication required" }
        "lockout" { "🚫 Anomalous behavior - Account locked" }
        default { "Unknown action" }
    }
    
    Write-Host "     $actionMessage" -ForegroundColor $actionColor
    
} catch {
    Write-Host "  ❌ Behavior analysis failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 5: Test with different behavior patterns
Write-Host "🔬 Step 5: Testing different behavior patterns..." -ForegroundColor Yellow

$testCases = @(
    @{
        name = "Normal behavior"
        data = @{
            avg_key_interval = 0.30
            mouse_speed = 120
            click_variance = 0.20
            nav_entropy = 0.80
        }
    },
    @{
        name = "Slightly suspicious"
        data = @{
            avg_key_interval = 0.45
            mouse_speed = 90
            click_variance = 0.35
            nav_entropy = 0.50
        }
    },
    @{
        name = "Very anomalous"
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
        $result = Invoke-RestMethod -Uri "$baseUrl/api/behavior" `
            -Method POST `
            -Headers $headers `
            -Body $testBehavior
        
        Write-Host "  Test: $($testCase.name)" -ForegroundColor Cyan
        Write-Host "    Score: $($result.trust_score) | Action: $($result.action)" -ForegroundColor Gray
    } catch {
        Write-Host "  Test failed: $($testCase.name)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 6: Direct ML Service test
Write-Host "🤖 Step 6: Testing ML Service directly..." -ForegroundColor Yellow

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
    $mlResult = Invoke-RestMethod -Uri "$mlUrl/analyze" `
        -Method POST `
        -ContentType "application/json" `
        -Body $mlTestData
    
    Write-Host "  ✅ ML Service direct call successful" -ForegroundColor Green
    Write-Host "     Trust Score: $($mlResult.trust_score)" -ForegroundColor Gray
    Write-Host "     Action: $($mlResult.action)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ ML Service direct call failed: $_" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✅ Integration Test Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Test Summary:" -ForegroundColor White
Write-Host "  • ML Service: Running" -ForegroundColor Green
Write-Host "  • Backend: Running" -ForegroundColor Green
Write-Host "  • User Registration: Working" -ForegroundColor Green
Write-Host "  • User Login: Working" -ForegroundColor Green
Write-Host "  • Behavior Analysis: Working" -ForegroundColor Green
Write-Host "  • Backend to ML Integration: Working" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 All systems operational!" -ForegroundColor Green
Write-Host ""
