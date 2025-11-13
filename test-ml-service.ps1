# Test ML Service with sample behavioral data

Write-Host "🧪 Testing ML Service with sample behavioral data`n" -ForegroundColor Cyan

# Check if ML service is running
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get -ErrorAction Stop
    Write-Host "✅ ML Service is running: $($healthCheck.message)`n" -ForegroundColor Green
} catch {
    Write-Host "❌ ML Service is not running!" -ForegroundColor Red
    Write-Host "   Please start it first: cd ml_service; python app.py`n" -ForegroundColor Yellow
    exit 1
}

# Test Case 1: Normal behavior
Write-Host "📊 Test Case 1: Normal Behavior" -ForegroundColor Yellow
$normalBehavior = @{
    user_id = "test_user"
    sample = @{
        avg_key_interval = 0.28
        mouse_speed = 118
        click_variance = 0.19
        nav_entropy = 0.81
    }
} | ConvertTo-Json

try {
    $result1 = Invoke-RestMethod -Uri "http://localhost:5000/analyze" -Method Post -Body $normalBehavior -ContentType "application/json"
    Write-Host "   Trust Score: $($result1.trust_score)" -ForegroundColor Green
    Write-Host "   Action: $($result1.action)" -ForegroundColor Green
    Write-Host "   Expected: High trust score (85+), action = 'allow'`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test Case 2: Suspicious behavior (unusual typing)
Write-Host "📊 Test Case 2: Suspicious Behavior (Unusual Typing)" -ForegroundColor Yellow
$suspiciousBehavior = @{
    user_id = "test_user"
    sample = @{
        avg_key_interval = 0.65
        mouse_speed = 120
        click_variance = 0.18
        nav_entropy = 0.79
    }
} | ConvertTo-Json

try {
    $result2 = Invoke-RestMethod -Uri "http://localhost:5000/analyze" -Method Post -Body $suspiciousBehavior -ContentType "application/json"
    Write-Host "   Trust Score: $($result2.trust_score)" -ForegroundColor Yellow
    Write-Host "   Action: $($result2.action)" -ForegroundColor Yellow
    Write-Host "   Expected: Medium trust score (65-84), action = 'reauth'`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test Case 3: Anomalous behavior (very different from baseline)
Write-Host "📊 Test Case 3: Anomalous Behavior (Very Different)" -ForegroundColor Yellow
$anomalousBehavior = @{
    user_id = "test_user"
    sample = @{
        avg_key_interval = 1.2
        mouse_speed = 300
        click_variance = 0.8
        nav_entropy = 0.2
    }
} | ConvertTo-Json

try {
    $result3 = Invoke-RestMethod -Uri "http://localhost:5000/analyze" -Method Post -Body $anomalousBehavior -ContentType "application/json"
    Write-Host "   Trust Score: $($result3.trust_score)" -ForegroundColor Red
    Write-Host "   Action: $($result3.action)" -ForegroundColor Red
    Write-Host "   Expected: Low trust score (<65), action = 'lockout'`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "✨ ML Service testing complete!`n" -ForegroundColor Green
Write-Host "📋 The ML model uses these 4 features:" -ForegroundColor Cyan
Write-Host "   1. avg_key_interval - Average time between keystrokes" -ForegroundColor White
Write-Host "   2. mouse_speed - Speed of mouse movements" -ForegroundColor White
Write-Host "   3. click_variance - Variance in click intervals" -ForegroundColor White
Write-Host "   4. nav_entropy - Randomness of navigation patterns`n" -ForegroundColor White
