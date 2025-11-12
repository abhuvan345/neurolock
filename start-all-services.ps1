# NeuroLock - Complete Integration Test Script
# This script starts all services and tests the behavioral tracking flow

Write-Host "🔐 NeuroLock - Starting All Services" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if MongoDB is running
Write-Host "📊 Checking MongoDB connection..." -ForegroundColor Yellow
$mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
if (-not $mongoCheck.TcpTestSucceeded) {
    Write-Host "❌ MongoDB is not running on port 27017" -ForegroundColor Red
    Write-Host "   Please start MongoDB first" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ MongoDB is running`n" -ForegroundColor Green

# Step 1: Start ML Service
Write-Host "🤖 Step 1: Starting ML Service (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ml_service; python app.py" -WindowStyle Normal
Start-Sleep -Seconds 3

# Test ML Service
Write-Host "   Testing ML Service..." -ForegroundColor Gray
try {
    $mlTest = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get -ErrorAction Stop
    Write-Host "✅ ML Service is running: $($mlTest.message)`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ML Service may need more time to start`n" -ForegroundColor Yellow
}

# Step 2: Start Backend
Write-Host "🔧 Step 2: Starting Backend (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd neurolock-backend; node server.js" -WindowStyle Normal
Start-Sleep -Seconds 3

# Test Backend
Write-Host "   Testing Backend..." -ForegroundColor Gray
try {
    $backendTest = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is running`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend may need more time to start`n" -ForegroundColor Yellow
}

# Step 3: Start Frontend
Write-Host "🎨 Step 3: Starting Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd neurolock-frontend; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "`n✨ All services should be starting!" -ForegroundColor Green
Write-Host "====================================`n" -ForegroundColor Cyan

Write-Host "📋 Service URLs:" -ForegroundColor Cyan
Write-Host "   ML Service:  http://localhost:5000" -ForegroundColor White
Write-Host "   Backend:     http://localhost:8080" -ForegroundColor White
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White

Write-Host "`n🔍 How to test the behavioral tracking:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "   2. Login with any credentials" -ForegroundColor White
Write-Host "   3. Move your mouse, type, click, and scroll on the dashboard" -ForegroundColor White
Write-Host "   4. Watch the Trust Score update every 5 seconds" -ForegroundColor White
Write-Host "   5. The system will analyze:" -ForegroundColor White
Write-Host "      - avg_key_interval (typing rhythm)" -ForegroundColor Gray
Write-Host "      - mouse_speed (mouse movement speed)" -ForegroundColor Gray
Write-Host "      - click_variance (click pattern consistency)" -ForegroundColor Gray
Write-Host "      - nav_entropy (navigation randomness)" -ForegroundColor Gray

Write-Host "`n📊 Data Flow:" -ForegroundColor Yellow
Write-Host "   Frontend → Captures behavior" -ForegroundColor White
Write-Host "   Frontend API → Sends to Backend" -ForegroundColor White
Write-Host "   Backend → Forwards to ML Service" -ForegroundColor White
Write-Host "   ML Service → Analyzes with AI model" -ForegroundColor White
Write-Host "   ML Service → Returns trust score & action" -ForegroundColor White
Write-Host "   Backend → Stores in MongoDB" -ForegroundColor White
Write-Host "   Frontend → Displays trust score" -ForegroundColor White

Write-Host "`n🎯 Trust Score Actions:" -ForegroundColor Yellow
Write-Host "   85-100: ✅ Allow (Normal behavior)" -ForegroundColor Green
Write-Host "   65-84:  ⚠️  Re-auth (Suspicious behavior)" -ForegroundColor Yellow
Write-Host "   0-64:   🔒 Lockout (Anomalous behavior)" -ForegroundColor Red

Write-Host "`n💡 Press Ctrl+C in any window to stop that service" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan
