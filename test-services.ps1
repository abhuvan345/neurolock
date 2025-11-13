# test-services.ps1
# Test script for NeuroLock services

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   NeuroLock Services Connection Test" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test ML Service
Write-Host "1. Testing ML Service (http://localhost:5000)..." -ForegroundColor Yellow
try {
    $mlResponse = Invoke-RestMethod -Uri "http://localhost:5000/" -Method GET
    Write-Host "   ✅ ML Service is running" -ForegroundColor Green
    Write-Host "   Response: $($mlResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ ML Service is not running" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test Backend
Write-Host "2. Testing Backend (http://localhost:8080)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method GET
    Write-Host "   ✅ Backend is running" -ForegroundColor Green
    Write-Host "   Status: $($backendResponse.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend is not running" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test ML Service analyze endpoint
Write-Host "3. Testing ML Service analyze endpoint..." -ForegroundColor Yellow
try {
    $testData = @{
        user_id = "test_user_123"
        sample = @{
            avg_key_interval = 0.28
            mouse_speed = 118
            click_variance = 0.19
            nav_entropy = 0.81
        }
    } | ConvertTo-Json

    $analyzeResponse = Invoke-RestMethod -Uri "http://localhost:5000/analyze" -Method POST -ContentType "application/json" -Body $testData
    Write-Host "   ✅ ML Service analysis successful" -ForegroundColor Green
    Write-Host "   Trust Score: $($analyzeResponse.trust_score)" -ForegroundColor Gray
    Write-Host "   Action: $($analyzeResponse.action)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ ML Service analysis failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Test Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services Status:" -ForegroundColor White
Write-Host "  - ML Service (Port 5000): Check above" -ForegroundColor White
Write-Host "  - Backend (Port 8080): Check above" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Register: POST http://localhost:8080/api/auth/register" -ForegroundColor Gray
Write-Host "  2. Login: POST http://localhost:8080/api/auth/login" -ForegroundColor Gray
Write-Host "  3. Test behavior: POST http://localhost:8080/api/behavior" -ForegroundColor Gray
Write-Host ""
