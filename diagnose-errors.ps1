# Diagnostic Script to Identify NeuroLock Errors

Write-Host "🔍 NeuroLock Error Diagnostic Tool`n" -ForegroundColor Cyan

# Test 1: Check MongoDB Connection
Write-Host "1️⃣ Testing MongoDB Connection..." -ForegroundColor Yellow
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue -ErrorAction Stop
    if ($mongoTest.TcpTestSucceeded) {
        Write-Host "   ✅ MongoDB is running on port 27017`n" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MongoDB is NOT running!" -ForegroundColor Red
        Write-Host "   Please start MongoDB first`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error checking MongoDB: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 2: Check ML Service
Write-Host "2️⃣ Testing ML Service (Port 5000)..." -ForegroundColor Yellow
try {
    $mlHealth = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ ML Service: $($mlHealth.message)`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ ML Service is NOT running!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Start with: cd ml_service; python app.py`n" -ForegroundColor Yellow
}

# Test 3: Check Backend
Write-Host "3️⃣ Testing Backend (Port 8080)..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Backend: $($backendHealth.status)`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Start with: cd neurolock-backend; node server.js`n" -ForegroundColor Yellow
}

# Test 4: Check Frontend
Write-Host "4️⃣ Testing Frontend (Port 3000)..." -ForegroundColor Yellow
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 3 -ErrorAction Stop
    if ($frontendTest.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is running`n" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Frontend is NOT running!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Start with: cd neurolock-frontend; npm run dev`n" -ForegroundColor Yellow
}

# Test 5: Test ML Service Endpoint
Write-Host "5️⃣ Testing ML Service /analyze endpoint..." -ForegroundColor Yellow
try {
    $testData = @{
        user_id = "test_user"
        sample = @{
            avg_key_interval = 0.28
            mouse_speed = 118
            click_variance = 0.19
            nav_entropy = 0.81
        }
    } | ConvertTo-Json

    $mlAnalyze = Invoke-RestMethod -Uri "http://localhost:5000/analyze" -Method Post -Body $testData -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ ML /analyze works!" -ForegroundColor Green
    Write-Host "   Trust Score: $($mlAnalyze.trust_score), Action: $($mlAnalyze.action)`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ ML /analyze failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 6: Check Environment Files
Write-Host "6️⃣ Checking Configuration Files..." -ForegroundColor Yellow

if (Test-Path "neurolock-backend\.env") {
    Write-Host "   ✅ Backend .env exists" -ForegroundColor Green
    $backendEnv = Get-Content "neurolock-backend\.env"
    if ($backendEnv -match "ML_SERVICE_URL") {
        Write-Host "   ✅ ML_SERVICE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  ML_SERVICE_URL not found in .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Backend .env NOT found!" -ForegroundColor Red
}

if (Test-Path "neurolock-frontend\.env.local") {
    Write-Host "   ✅ Frontend .env.local exists" -ForegroundColor Green
    $frontendEnv = Get-Content "neurolock-frontend\.env.local"
    if ($frontendEnv -match "NEXT_PUBLIC_BACKEND_URL") {
        Write-Host "   ✅ NEXT_PUBLIC_BACKEND_URL configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  NEXT_PUBLIC_BACKEND_URL not found in .env.local" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Frontend .env.local NOT found!" -ForegroundColor Red
}

Write-Host ""

# Test 7: Check Python Dependencies
Write-Host "7️⃣ Checking Python Dependencies..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ Python: $pythonVersion" -ForegroundColor Green
    
    # Check required packages
    $packages = @("flask", "flask-cors", "scikit-learn", "pandas", "numpy", "joblib")
    foreach ($pkg in $packages) {
        $installed = pip show $pkg 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $pkg installed" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $pkg NOT installed!" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ❌ Python error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "🔧 Common Issues & Solutions:`n" -ForegroundColor Yellow

Write-Host "Issue: MongoDB not running" -ForegroundColor White
Write-Host "  Solution: Start MongoDB service or Docker container`n" -ForegroundColor Gray

Write-Host "Issue: ML Service not responding" -ForegroundColor White
Write-Host "  Solution: cd ml_service; pip install -r requirements.txt; python app.py`n" -ForegroundColor Gray

Write-Host "Issue: Backend not running" -ForegroundColor White
Write-Host "  Solution: cd neurolock-backend; npm install; node server.js`n" -ForegroundColor Gray

Write-Host "Issue: Frontend not running" -ForegroundColor White
Write-Host "  Solution: cd neurolock-frontend; npm install; npm run dev`n" -ForegroundColor Gray

Write-Host "Issue: CORS errors in browser" -ForegroundColor White
Write-Host "  Solution: Ensure backend CORS is enabled (already done in server.js)`n" -ForegroundColor Gray

Write-Host "Issue: 401 Unauthorized errors" -ForegroundColor White
Write-Host "  Solution: Demo token is enabled, should work without real auth`n" -ForegroundColor Gray

Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan
