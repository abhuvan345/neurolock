# Test Backend Behavior Endpoint

Write-Host "🧪 Testing Backend /api/behavior Endpoint`n" -ForegroundColor Cyan

# Test data
$testBody = @{
    features = @{
        avg_key_interval = 0.28
        mouse_speed = 118
        click_variance = 0.19
        nav_entropy = 0.81
    }
} | ConvertTo-Json

Write-Host "📤 Sending request to backend..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:8080/api/behavior" -ForegroundColor Gray
Write-Host "Body: $testBody`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/behavior" `
        -Method Post `
        -Body $testBody `
        -ContentType "application/json" `
        -Headers @{Authorization="Bearer demo_token_for_testing"} `
        -ErrorAction Stop
    
    Write-Host "✅ Backend responded successfully!" -ForegroundColor Green
    Write-Host "Trust Score: $($response.trust_score)" -ForegroundColor Cyan
    Write-Host "Action: $($response.action)`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Backend request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Try to get response body
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Response Body: $body`n" -ForegroundColor Yellow
    } catch {
        Write-Host ""
    }
}

# Test with zero values (like frontend initially sends)
Write-Host "📤 Testing with zero values (initial state)..." -ForegroundColor Yellow
$zeroBody = @{
    features = @{
        avg_key_interval = 0
        mouse_speed = 0
        click_variance = 0
        nav_entropy = 0
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/behavior" `
        -Method Post `
        -Body $zeroBody `
        -ContentType "application/json" `
        -Headers @{Authorization="Bearer demo_token_for_testing"} `
        -ErrorAction Stop
    
    Write-Host "✅ Backend responded successfully!" -ForegroundColor Green
    Write-Host "Trust Score: $($response.trust_score)" -ForegroundColor Cyan
    Write-Host "Action: $($response.action)`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Backend request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Check if backend is running
    Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Is backend running? Check terminal running 'node server.js'" -ForegroundColor White
    Write-Host "2. Is MongoDB connected? Check backend logs for connection errors" -ForegroundColor White
    Write-Host "3. Is ML service running? Test with: .\test-ml-service.ps1`n" -ForegroundColor White
}
