# 🔄 NeuroLock - Complete Behavioral Data Flow

## Step-by-Step Process

### 1️⃣ User Interaction (Frontend)

```
User performs actions:
├── Typing on keyboard
├── Moving mouse
├── Clicking
└── Scrolling

Tracked by: useBehaviorTracking() hook
Location: neurolock-frontend/hooks/use-behavior-tracking.tsx
```

### 2️⃣ Feature Aggregation (Every 5 seconds)

```javascript
// Calculated metrics from user behavior:
{
  avg_key_interval: 0.28,     // Average time between keystrokes (seconds)
  avg_key_hold: 0.15,          // Average key hold duration (seconds)
  mouse_speed: 118,            // Mouse movement speed (pixels/second)
  click_rate: 0.5,             // Clicks per second
  click_variance: 0.19,        // Variance in click timing (ms²)
  scroll_rate: 1.2,            // Scrolls per second
  nav_entropy: 0.81,           // Navigation randomness (0-1)
  time_on_page: 30             // Time spent on page (seconds)
}
```

### 3️⃣ Send to Frontend API

```
Hook: useApiPolling()
File: neurolock-frontend/hooks/use-api-polling.tsx

POST /api/behavior
Body: { userId, features }
```

### 4️⃣ Frontend API Processing

```typescript
File: neurolock-frontend/app/api/behavior/route.ts

// Extract ONLY 4 features needed by ML model:
const mlFeatures = {
  avg_key_interval: features.avg_key_interval,
  mouse_speed: features.mouse_speed,
  click_variance: features.click_variance,
  nav_entropy: features.nav_entropy
}

// Forward to backend
POST http://localhost:8080/api/behavior
Headers: { Authorization: "Bearer <token>" }
Body: { features: mlFeatures }
```

### 5️⃣ Backend Receives Request

```javascript
File: neurolock - backend / routes / behavior.js;

// Validate JWT token
authMiddleware();

// Extract userId from token
const userId = req.user.id; // e.g., "demo_user_001"

// Extract features
const mlFeatures = {
  avg_key_interval: features.avg_key_interval || 0,
  mouse_speed: features.mouse_speed || 0,
  click_variance: features.click_variance || 0,
  nav_entropy: features.nav_entropy || 0,
};
```

### 6️⃣ Call ML Service

```javascript
File: neurolock-backend/utils/mlClient.js

POST http://localhost:5000/analyze
Body: {
  user_id: "demo_user_001",
  sample: {
    avg_key_interval: 0.28,
    mouse_speed: 118,
    click_variance: 0.19,
    nav_entropy: 0.81
  }
}
```

### 7️⃣ ML Service Processing

```python
File: ml_service/app.py → prototype_pipeline.py

1. Load user model: models/demo_user_001_model.pkl
   - If not exists, create synthetic baseline and train

2. Ensure feature order:
   ["avg_key_interval", "mouse_speed", "click_variance", "nav_entropy"]

3. Scale features using saved scaler

4. Evaluate with Isolation Forest:
   score = model.decision_function(X_scaled)[0]

5. Normalize score to 0-100:
   trust_score = int((score + 1) * 50)

6. Determine action:
   - trust_score >= 85  → "allow"
   - trust_score >= 65  → "reauth"
   - trust_score < 65   → "lockout"

7. Return: { trust_score: 87, action: "allow" }
```

### 8️⃣ Backend Stores & Returns

```javascript
File: neurolock-backend/routes/behavior.js

// Map action to status
status = action === "allow" ? "active"
       : action === "reauth" ? "warning"
       : "locked"

// Save to MongoDB
Session.create({
  userId: "demo_user_001",
  trustScore: 87,
  status: "active",
  features: mlFeatures
})

// If anomaly, log it
if (status !== "active") {
  Anomaly.create({
    sessionId: session._id,
    userId: "demo_user_001",
    summary: "System action: reauth (Trust Score: 72)"
  })
}

// Return to frontend API
Response: { trust_score: 87, action: "allow" }
```

### 9️⃣ Frontend API Returns

```typescript
File: neurolock-frontend/app/api/behavior/route.ts

// Map action to frontend status
status = action === "allow" ? "active"
       : action === "reauth" ? "warning"
       : "locked"

summary = status === "active"
  ? "Normal behavioral patterns detected"
  : status === "warning"
  ? "Unusual behavior detected. Increased verification may be required."
  : "Suspicious activity detected. Re-authentication required."

Response: {
  trust_score: 87,
  status: "active",
  summary: "Normal behavioral patterns detected"
}
```

### 🔟 Frontend Updates UI

```typescript
File: neurolock-frontend/hooks/use-api-polling.tsx

// Update state
setTrustScore(87)
setStatus("active")
setSummary("Normal behavioral patterns detected")

// Add to trend data
setTrendData([...prev, { timestamp: "12:30", score: 87 }])

// Components re-render:
├── TrustMeter (shows 87% with green arc)
├── TrustTrend (updates chart)
├── TelemetryCards (shows latest metrics)
└── ActivityLog (adds entry if status changed)
```

## 🎯 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ User Types, Moves Mouse, Clicks, Scrolls             │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │ useBehaviorTracking() Hook                           │  │
│  │ Collects: 8 behavioral features every 5 seconds      │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │ useApiPolling() Hook                                 │  │
│  │ POST /api/behavior every 5 seconds                   │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │ /app/api/behavior/route.ts                           │  │
│  │ Extract 4 ML features → Forward to backend           │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │ HTTP POST
                      │ localhost:8080/api/behavior
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                        BACKEND                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /routes/behavior.js                                  │  │
│  │ Validate JWT → Extract userId & features            │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │ /utils/mlClient.js                                   │  │
│  │ POST localhost:5000/analyze                          │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │ HTTP POST
                      │ { user_id, sample }
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     ML SERVICE                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ app.py → /analyze endpoint                           │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │ prototype_pipeline.py → evaluate_sample()            │  │
│  │                                                       │  │
│  │ 1. Load model: models/{user_id}_model.pkl            │  │
│  │ 2. Order features correctly                          │  │
│  │ 3. Scale with saved scaler                           │  │
│  │ 4. Run Isolation Forest                              │  │
│  │ 5. Normalize score to 0-100                          │  │
│  │ 6. Determine action (allow/reauth/lockout)           │  │
│  │                                                       │  │
│  │ Return: { trust_score: 87, action: "allow" }         │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │ JSON Response
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                        BACKEND                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Store in MongoDB:                                    │  │
│  │ ├── Session (userId, trustScore, status, features)   │  │
│  │ └── Anomaly (if status != active)                    │  │
│  │                                                       │  │
│  │ Return to frontend: { trust_score, action }          │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │ JSON Response
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /app/api/behavior/route.ts                           │  │
│  │ Map action → status (active/warning/locked)          │  │
│  │ Return: { trust_score, status, summary }             │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │ useApiPolling() Hook                                 │  │
│  │ Update state: trustScore, status, summary            │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │ UI Components Re-render:                             │  │
│  │ ├── TrustMeter (visual gauge)                        │  │
│  │ ├── TrustTrend (line chart)                          │  │
│  │ ├── TelemetryCards (metrics display)                 │  │
│  │ └── ActivityLog (event timeline)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Key Points

1. **Frontend captures 8 behavioral features** but only sends 4 to ML model
2. **Feature extraction happens in 3 places:**

   - Frontend hook (captures all 8)
   - Frontend API (filters to 4)
   - Backend (validates the 4)

3. **ML model uses ONLY 4 features:**

   - avg_key_interval
   - mouse_speed
   - click_variance
   - nav_entropy

4. **Trust score determines action:**

   - 85-100: Allow (green)
   - 65-84: Re-auth (yellow)
   - 0-64: Lockout (red)

5. **Data is stored at each level:**
   - Frontend: Local state + trend history
   - Backend: MongoDB (sessions + anomalies)
   - ML Service: User models (.pkl files)

## 📦 Data Structures

### Frontend → Frontend API

```typescript
{
  userId: "demo_user_001",
  features: {
    avg_key_interval: 0.28,
    avg_key_hold: 0.15,
    mouse_speed: 118,
    click_rate: 0.5,
    click_variance: 0.19,
    scroll_rate: 1.2,
    nav_entropy: 0.81,
    time_on_page: 30
  }
}
```

### Frontend API → Backend

```typescript
{
  features: {
    avg_key_interval: 0.28,
    mouse_speed: 118,
    click_variance: 0.19,
    nav_entropy: 0.81
  }
}
```

### Backend → ML Service

```json
{
  "user_id": "demo_user_001",
  "sample": {
    "avg_key_interval": 0.28,
    "mouse_speed": 118,
    "click_variance": 0.19,
    "nav_entropy": 0.81
  }
}
```

### ML Service → Backend

```json
{
  "trust_score": 87,
  "action": "allow"
}
```

### Backend → Frontend API

```json
{
  "trust_score": 87,
  "action": "allow"
}
```

### Frontend API → Frontend

```json
{
  "trust_score": 87,
  "status": "active",
  "summary": "Normal behavioral patterns detected"
}
```

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Browser Console:**

   ```
   [v0] Submitting behavior data: { userId: "demo_user_001", features: {...} }
   [Frontend API] Sending to backend: { userId: "demo_user_001", features: {...} }
   [Frontend API] Backend response: { trust_score: 87, action: "allow" }
   ```

2. **Backend Terminal:**

   ```
   📊 Sending to ML Service: { userId: "demo_user_001", features: {...} }
   🤖 ML Service response: { trust_score: 87, action: "allow" }
   ```

3. **ML Service Terminal:**

   ```
   127.0.0.1 - - [date] "POST /analyze HTTP/1.1" 200 -
   ```

4. **Frontend UI:**
   - Trust Meter shows current score (e.g., 87%)
   - Trust Trend chart updates with new data point
   - Telemetry Cards show latest behavioral metrics
   - Status indicator is green (Active)
