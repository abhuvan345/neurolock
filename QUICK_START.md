# 🚀 Quick Start Guide - NeuroLock Behavioral Tracking

## ✅ What's Been Implemented

### 1. Frontend Behavioral Tracking ✓

- **File:** `neurolock-frontend/hooks/use-behavior-tracking.tsx`
- **Captures:** 8 behavioral metrics including:
  - avg_key_interval (typing rhythm)
  - mouse_speed (movement speed)
  - click_variance (click consistency)
  - nav_entropy (navigation patterns)
  - And 4 additional metrics for future use

### 2. Frontend API Integration ✓

- **File:** `neurolock-frontend/app/api/behavior/route.ts`
- **Function:** Extracts 4 ML features and forwards to backend
- **Fallback:** Works offline with mock data if backend unavailable

### 3. Backend Behavior Route ✓

- **File:** `neurolock-backend/routes/behavior.js`
- **Function:** Validates auth, forwards to ML service, stores results
- **Demo Support:** Accepts demo token for testing

### 4. ML Service Integration ✓

- **File:** `ml_service/prototype_pipeline.py`
- **Function:** Analyzes 4 features with Isolation Forest model
- **Output:** Trust score (0-100) and action (allow/reauth/lockout)

### 5. Configuration Files ✓

- **Frontend:** `.env.local` with backend URL
- **Backend:** `.env` with MongoDB and ML service URLs
- **All services:** Properly configured to communicate

### 6. Helper Scripts ✓

- **start-all-services.ps1** - Starts all 3 services automatically
- **test-ml-service.ps1** - Tests ML service with sample data

## 🎯 How to Run

### Step 1: Start All Services

```powershell
# From the NeuroLock folder:
.\start-all-services.ps1
```

This will open 3 PowerShell windows:

- **ML Service** (Port 5000)
- **Backend** (Port 8080)
- **Frontend** (Port 3000)

### Step 2: Open the Application

```
http://localhost:3000
```

### Step 3: Login

- Email: `user@demo.com`
- Password: `neuro123`

### Step 4: Interact with the Dashboard

- **Type** on the keyboard
- **Move** the mouse around
- **Click** on various elements
- **Scroll** up and down

### Step 5: Watch the Trust Score Update

- Updates every **5 seconds**
- Shows in the **Trust Meter** (left side)
- Displays **behavioral metrics** in telemetry cards
- Plots **trend over time** in the chart

## 📊 What You'll See

### Trust Meter

```
┌─────────────────────┐
│   Trust Status      │
│                     │
│       ⚪            │
│      ╱  ╲           │
│     │ 87%│          │
│      ╲  ╱           │
│                     │
│   ✓ Normal          │
│                     │
│ Normal behavioral   │
│ patterns detected   │
└─────────────────────┘
```

### Telemetry Cards

```
┌──────────────┬──────────────┬──────────────┐
│ Typing Speed │ Mouse Speed  │ Click Pattern│
│    0.28 s    │   118 px/s   │   0.19 var   │
└──────────────┴──────────────┴──────────────┘
```

### Trust Trend Chart

```
100 ┤                           ╭──
 90 ┤                     ╭─────╯
 80 ┤               ╭─────╯
 70 ┤         ╭─────╯
 60 ┤   ╭─────╯
    └───┴─────┴─────┴─────┴─────┴─────
     12:00  12:05  12:10  12:15  12:20
```

## 🔍 Verification Steps

### 1. Check ML Service

```powershell
.\test-ml-service.ps1
```

Should show:

```
✅ ML Service is running
📊 Test Case 1: Normal Behavior
   Trust Score: 87
   Action: allow
```

### 2. Check Backend

```powershell
# In a new terminal
curl http://localhost:8080/health
```

### 3. Check Frontend

Open browser console (F12) and look for:

```
[v0] Submitting behavior data: {...}
[Frontend API] Sending to backend: {...}
[Frontend API] Backend response: { trust_score: 87, action: "allow" }
```

## 📈 Understanding Trust Scores

| Score  | Status     | Color  | Action           |
| ------ | ---------- | ------ | ---------------- |
| 85-100 | ✅ Active  | Green  | Continue session |
| 65-84  | ⚠️ Warning | Yellow | Re-authenticate  |
| 0-64   | 🔒 Locked  | Red    | Session locked   |

## 🎯 The 4 ML Features Explained

1. **avg_key_interval** (seconds)

   - Normal: ~0.25-0.35s
   - What it means: How fast you type
   - Why it matters: Typing rhythm is unique per person

2. **mouse_speed** (pixels/second)

   - Normal: ~100-150 px/s
   - What it means: How fast you move the mouse
   - Why it matters: Movement speed is consistent for each user

3. **click_variance** (milliseconds²)

   - Normal: ~0.15-0.25
   - What it means: How consistent your click timing is
   - Why it matters: Click patterns are habitual

4. **nav_entropy** (0-1 scale)
   - Normal: ~0.7-0.9
   - What it means: How randomly you navigate (high = more random)
   - Why it matters: Navigation patterns reveal user behavior

## 🛠️ Troubleshooting

### "ML Service not running"

```powershell
cd ml_service
python app.py
```

### "Backend connection failed"

1. Check MongoDB is running
2. Verify `.env` file exists in `neurolock-backend`
3. Run: `cd neurolock-backend; node server.js`

### "Frontend not updating trust score"

1. Check all services are running
2. Interact with the page (type, move mouse)
3. Wait 5 seconds for next update
4. Check browser console for errors

### "Trust score stuck at 85"

This means backend is offline and frontend is using mock data.

- Check backend terminal for errors
- Verify backend URL in `.env.local`

## 📚 Additional Documentation

- **BEHAVIORAL_FLOW.md** - Complete API documentation
- **DATA_FLOW_VISUALIZATION.md** - Detailed flow diagrams
- **README.md** - Project overview

## 🎉 Success Checklist

- [ ] All 3 services started successfully
- [ ] Can login at http://localhost:3000
- [ ] Trust meter shows a score (not stuck at 85)
- [ ] Telemetry cards update when you interact
- [ ] Trust trend chart shows data points
- [ ] Browser console shows API calls
- [ ] Backend terminal shows ML service calls
- [ ] No error messages in any terminal

## 💡 Next Steps

1. **Test different behaviors:**

   - Type very slowly → should lower trust score
   - Move mouse erratically → should affect score
   - Change click patterns → should be detected

2. **Monitor the logs:**

   - Watch data flow through all 3 services
   - See how trust score changes

3. **Check MongoDB:**

   - Install MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - View `neurolock` database
   - See sessions and anomalies collections

4. **Experiment with thresholds:**
   - Edit `prototype_pipeline.py` lines 52-57
   - Change trust score thresholds
   - Restart ML service to apply changes

## 🔐 Security Note

**Demo token is enabled for testing!**

- Current setup accepts `demo_token_for_testing`
- This bypasses JWT authentication
- Remove this in production (edit `neurolock-backend/routes/behavior.js`)

---

**Ready to test?** Run `.\start-all-services.ps1` and open http://localhost:3000! 🚀
