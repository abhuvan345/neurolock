# 🔧 NeuroLock Troubleshooting Guide

## 🚨 Common Errors & Solutions

### 1. TypeScript Errors Fixed ✅

**Fixed Issues:**

- Added proper TypeScript types to API routes
- Changed from `Response` to `NextResponse` (Next.js 13+ standard)
- Added `NextRequest` type annotation

**Files Updated:**

- `neurolock-frontend/app/api/behavior/route.ts`
- `neurolock-frontend/app/api/re-auth/route.ts`

---

## 🔍 Run Diagnostics

Before troubleshooting manually, run the diagnostic script:

```powershell
.\diagnose-errors.ps1
```

This will check:

- ✓ MongoDB connection
- ✓ ML Service status
- ✓ Backend status
- ✓ Frontend status
- ✓ Environment files
- ✓ Python dependencies

---

## 💥 Error Categories

### MongoDB Errors

**Error: "MongoServerError: connect ECONNREFUSED"**

```
Solution:
1. Start MongoDB service:
   - Windows: net start MongoDB
   - Docker: docker start mongodb
   - Manual: mongod --dbpath /path/to/data

2. Check connection string in neurolock-backend/.env
   MONGO_URI should match your MongoDB instance
```

**Error: "Connection timeout"**

```
Solution:
- If using MongoDB Atlas (cloud):
  1. Check internet connection
  2. Whitelist your IP in Atlas dashboard
  3. Verify connection string includes correct credentials
```

---

### ML Service Errors

**Error: "ModuleNotFoundError: No module named 'flask'"**

```
Solution:
cd ml_service
pip install -r requirements.txt
```

**Error: "Address already in use (Port 5000)"**

```
Solution:
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in ml_service/app.py:
port = int(os.environ.get("PORT", 5001))  # Changed to 5001
```

**Error: "Model not found for user"**

```
This is normal! The ML service will automatically:
1. Generate synthetic training data
2. Train a new model
3. Save it to models/{user_id}_model.pkl

You'll see: "⚠️ Model not found for demo_user_001, creating synthetic baseline."
```

**Error: "KeyError: 'avg_key_interval'"**

```
Solution:
The backend is not sending all 4 required features.
Check that mlFeatures includes:
- avg_key_interval
- mouse_speed
- click_variance
- nav_entropy
```

---

### Backend Errors

**Error: "Cannot find module 'express'"**

```
Solution:
cd neurolock-backend
npm install
```

**Error: "Error: secretOrPrivateKey must have a value"**

```
Solution:
Check neurolock-backend/.env file exists with:
JWT_SECRET=your_secret_key_here
```

**Error: "CORS policy: No 'Access-Control-Allow-Origin' header"**

```
Solution:
Backend already has CORS enabled in server.js
Make sure you're running the backend on correct port (8080)
```

**Error: "401 Unauthorized" when calling /api/behavior**

```
Solution:
Demo token is enabled! But if still getting 401:
1. Check Authorization header is being sent
2. Verify demo token in routes/behavior.js:
   if (token === "demo_token_for_testing") { ... }
```

**Error: "ML Service or server error"**

```
Solution:
1. Check ML Service is running (port 5000)
2. Check ML_SERVICE_URL in .env:
   ML_SERVICE_URL=http://localhost:5000
3. Test ML service directly:
   .\test-ml-service.ps1
```

---

### Frontend Errors

**Error: "npm ERR! code ENOENT"**

```
Solution:
cd neurolock-frontend
npm install
```

**Error: "Module not found: Can't resolve 'next/server'"**

```
Solution:
npm install next@latest
```

**Error: "Hydration failed"**

```
Solution:
Clear browser cache and restart dev server:
1. Stop frontend (Ctrl+C)
2. Delete .next folder
3. npm run dev
```

**Error: "fetch failed" in browser console**

```
Solution:
1. Backend not running - start it
2. Wrong backend URL - check .env.local:
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
3. CORS issue - backend should have cors() enabled
```

**Error: "Trust score stuck at 85"**

```
This means frontend is in offline mode!
Backend is not responding.

Solution:
1. Check backend is running (http://localhost:8080/health)
2. Check browser console for error messages
3. Verify NEXT_PUBLIC_BACKEND_URL in .env.local
4. Restart frontend after changing .env.local
```

**Error: "Behavioral tracking not working"**

```
Solution:
1. Make sure you're on the dashboard page (not login)
2. Check browser console for errors
3. Interact with page (type, move mouse, click)
4. Wait 5 seconds for first update
5. Check that isMonitoring is true
```

---

## 🔄 Full Reset Procedure

If nothing works, try a complete reset:

### Step 1: Stop All Services

```powershell
# Stop all running terminals
# Press Ctrl+C in each terminal window
```

### Step 2: Clean Install

```powershell
# Backend
cd neurolock-backend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install

# Frontend
cd ../neurolock-frontend
Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue
npm install

# ML Service
cd ../ml_service
pip install --upgrade -r requirements.txt
```

### Step 3: Verify Environment Files

```powershell
# Check backend .env
cat neurolock-backend\.env

# Check frontend .env.local
cat neurolock-frontend\.env.local
```

### Step 4: Start Services in Order

```powershell
# Terminal 1: ML Service
cd ml_service
python app.py

# Terminal 2: Backend (wait 5 seconds)
cd neurolock-backend
node server.js

# Terminal 3: Frontend (wait 5 seconds)
cd neurolock-frontend
npm run dev
```

### Step 5: Test Each Service

```powershell
# Run diagnostic script
.\diagnose-errors.ps1
```

---

## 🐛 Debugging Tips

### Enable Verbose Logging

**Backend:**

```javascript
// Add to server.js after cors()
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Frontend:**
Open browser DevTools (F12):

- Console tab: See API calls and errors
- Network tab: See HTTP requests/responses
- Application tab: Check localStorage for userId

**ML Service:**

```python
# Already has logging enabled
# Watch for:
# - "⚠️ Model not found" (normal on first run)
# - "✅ Model for user X trained and saved"
# - Incoming requests logged by Flask
```

### Check Data Flow

Use these console.log statements to trace data:

**Frontend Hook (use-api-polling.tsx):**

```typescript
console.log("[Polling] Submitting:", { userId, features });
```

**Frontend API (route.ts):**

```typescript
console.log("[Frontend API] Sending to backend:", mlFeatures);
console.log("[Frontend API] Backend response:", data);
```

**Backend (behavior.js):**

```javascript
console.log("📊 Sending to ML Service:", { userId, features: mlFeatures });
console.log("🤖 ML Service response:", { trust_score, action });
```

**ML Service (app.py):**

```python
print(f"Received request: user_id={user_id}, sample={sample}")
print(f"Returning: trust_score={trust_score}, action={action}")
```

---

## 📊 Expected Console Output

### When Everything Works:

**Browser Console:**

```
[v0] Submitting behavior data: {userId: "demo_user_001", features: {...}}
[Frontend API] Sending to backend: {userId: "demo_user_001", features: {...}}
[Frontend API] Backend response: {trust_score: 87, action: "allow"}
```

**Backend Terminal:**

```
🚀 Backend running on port 8080
📊 Sending to ML Service: { userId: 'demo_user_001', features: {...} }
🤖 ML Service response: { trust_score: 87, action: 'allow' }
```

**ML Service Terminal:**

```
 * Running on http://0.0.0.0:5000
⚠️ Model not found for demo_user_001, creating synthetic baseline.
✅ Model for demo_user_001 trained and saved.
127.0.0.1 - - [date] "POST /analyze HTTP/1.1" 200 -
```

---

## 🆘 Still Having Issues?

### Quick Checklist:

- [ ] MongoDB is running
- [ ] All 3 services started without errors
- [ ] No port conflicts (5000, 8080, 3000)
- [ ] Environment files exist and have correct URLs
- [ ] npm/pip dependencies installed
- [ ] Browser console shows no CORS errors
- [ ] You're logged in and on dashboard page
- [ ] You've interacted with the page (mouse/keyboard)

### Get More Help:

1. **Run diagnostics:**

   ```powershell
   .\diagnose-errors.ps1
   ```

2. **Check specific service:**

   ```powershell
   # Test ML Service
   .\test-ml-service.ps1
   ```

3. **View detailed logs:**

   - Check each terminal window for error messages
   - Look for red error text or stack traces
   - Note which service is failing

4. **Common Issue Patterns:**
   - If ML Service fails → Python environment issue
   - If Backend fails → MongoDB or dependency issue
   - If Frontend fails → Build or configuration issue
   - If API calls fail → Network or CORS issue

---

## ✅ Verification Steps

After fixing errors, verify everything works:

1. **Open http://localhost:3000**
2. **Login** with demo credentials
3. **Move mouse** around the dashboard
4. **Type** some text (in browser search or dev tools console)
5. **Click** various elements
6. **Wait 5-10 seconds**
7. **Check Trust Meter** updates
8. **Check Telemetry Cards** show numbers
9. **Check Trust Trend** has data points
10. **Check browser console** for successful API calls

If all 10 steps work → You're good to go! ✨
