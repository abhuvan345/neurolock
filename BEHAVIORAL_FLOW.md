# NeuroLock - Behavioral Biometric Authentication System

## 🎯 Overview

NeuroLock is a continuous authentication system that monitors user behavior in real-time and calculates a trust score using machine learning. The system tracks 4 key behavioral metrics and uses an AI model to detect anomalies.

## 📊 Behavioral Metrics Tracked

The system monitors these 4 features:

1. **avg_key_interval** - Average time between keystrokes (in seconds)
2. **mouse_speed** - Speed of mouse movements (pixels/second)
3. **click_variance** - Variance in click intervals (milliseconds²)
4. **nav_entropy** - Navigation randomness using grid-based entropy calculation

## 🔄 Data Flow

```
Frontend (React/Next.js)
    ↓ [Captures behavioral data via hooks]
    ↓ [Sends every 5 seconds]
    ↓
Frontend API Route (/api/behavior)
    ↓ [Extracts 4 required features]
    ↓ [HTTP POST]
    ↓
Backend (Node.js/Express) [Port 8080]
    ↓ [Validates auth token]
    ↓ [Forwards to ML service]
    ↓
ML Service (Python/Flask) [Port 5000]
    ↓ [Loads user model]
    ↓ [Evaluates with Isolation Forest]
    ↓ [Returns trust_score & action]
    ↓
Backend
    ↓ [Stores in MongoDB]
    ↓ [Returns to frontend]
    ↓
Frontend
    ↓ [Updates Trust Meter visualization]
    └─ [Shows real-time trust score]
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB (running on localhost:27017)
- npm or pnpm

### Installation

1. **Install Backend Dependencies**

   ```powershell
   cd neurolock-backend
   npm install
   ```

2. **Install Frontend Dependencies**

   ```powershell
   cd neurolock-frontend
   npm install
   ```

3. **Install ML Service Dependencies**
   ```powershell
   cd ml_service
   pip install -r requirements.txt
   ```

### Running the Application

**Option 1: Use the automated script**

```powershell
.\start-all-services.ps1
```

**Option 2: Manual startup**

1. Start ML Service (Terminal 1):

   ```powershell
   cd ml_service
   python app.py
   ```

2. Start Backend (Terminal 2):

   ```powershell
   cd neurolock-backend
   node server.js
   ```

3. Start Frontend (Terminal 3):
   ```powershell
   cd neurolock-frontend
   npm run dev
   ```

### Testing the ML Service

```powershell
.\test-ml-service.ps1
```

## 🔐 Authentication

### Demo Mode

- Email: `user@demo.com`
- Password: `neuro123`

### Production Mode

Register a user via the backend API:

```bash
POST http://localhost:8080/api/register
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

## 📡 API Endpoints

### ML Service (Port 5000)

**GET /** - Health check

```json
{ "message": "NeuroLock ML Service Active" }
```

**POST /analyze** - Analyze behavioral sample

```json
Request:
{
  "user_id": "user123",
  "sample": {
    "avg_key_interval": 0.28,
    "mouse_speed": 118,
    "click_variance": 0.19,
    "nav_entropy": 0.81
  }
}

Response:
{
  "trust_score": 87,
  "action": "allow"
}
```

**POST /train** - Train model for a user

```json
Request:
{
  "user_id": "user123"
}

Response:
{
  "message": "Model for user123 trained successfully"
}
```

### Backend (Port 8080)

**POST /api/login** - User login

```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "userId": "user_id"
}
```

**POST /api/behavior** - Submit behavioral data (requires auth)

```json
Request:
{
  "features": {
    "avg_key_interval": 0.28,
    "mouse_speed": 118,
    "click_variance": 0.19,
    "nav_entropy": 0.81
  }
}

Response:
{
  "trust_score": 87,
  "action": "allow"
}
```

### Frontend (Port 3000)

**POST /api/behavior** - Frontend proxy to backend

```json
Request:
{
  "userId": "user123",
  "features": {
    "avg_key_interval": 0.28,
    "avg_key_hold": 0.15,
    "mouse_speed": 118,
    "click_rate": 0.5,
    "click_variance": 0.19,
    "scroll_rate": 1.2,
    "nav_entropy": 0.81,
    "time_on_page": 30
  }
}

Response:
{
  "trust_score": 87,
  "status": "active",
  "summary": "Normal behavioral patterns detected"
}
```

## 🎯 Trust Score Actions

The ML model returns an action based on the trust score:

| Trust Score | Action    | Status     | Description                            |
| ----------- | --------- | ---------- | -------------------------------------- |
| 85-100      | `allow`   | ✅ Active  | Normal behavior - continue session     |
| 65-84       | `reauth`  | ⚠️ Warning | Suspicious - request re-authentication |
| 0-64        | `lockout` | 🔒 Locked  | Anomalous - lock session               |

## 🧪 How the ML Model Works

1. **Training Phase**

   - Uses synthetic baseline data (200 samples)
   - Trains an Isolation Forest model per user
   - Stores model in `ml_service/models/{user_id}_model.pkl`

2. **Evaluation Phase**

   - Receives 4 behavioral features
   - Scales features using stored scaler
   - Runs through Isolation Forest
   - Returns anomaly score normalized to 0-100
   - Maps score to action (allow/reauth/lockout)

3. **Feature Importance**
   - All 4 features are equally weighted
   - Model learns normal patterns during training
   - Detects deviations from baseline behavior

## 🔧 Configuration

### Frontend (.env.local)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### Backend (.env)

```env
MONGO_URI=mongodb://localhost:27017/neurolock
JWT_SECRET=your_secret_key
PORT=8080
ML_SERVICE_URL=http://localhost:5000
```

### ML Service

- Default port: 5000
- Models stored in: `ml_service/models/`

## 📊 MongoDB Collections

- **users** - User accounts and credentials
- **sessions** - Behavioral analysis sessions with trust scores
- **anomalies** - Logged anomalies and security events

## 🛠️ Development Tips

1. **Monitor logs in all 3 terminals** to see the data flow
2. **Check browser console** for frontend debugging
3. **Use test scripts** to verify each component independently
4. **MongoDB Compass** for viewing stored sessions and anomalies

## 🎨 Frontend Features

- **Real-time Trust Meter** - Visual gauge showing current trust score
- **Telemetry Cards** - Live display of behavioral metrics
- **Trust Trend Chart** - Historical trust score over time
- **Activity Log** - Timeline of authentication events
- **Locked Modal** - Re-authentication interface when locked
- **Warning Banner** - Alerts for suspicious behavior

## 🔒 Security Considerations

- JWT tokens expire after 4 hours
- Passwords are hashed with bcrypt
- Demo token only for testing (remove in production)
- Session data stored in MongoDB for audit trail
- Models are user-specific and not shared

## 📝 Future Enhancements

- [ ] Add more behavioral features (scroll patterns, idle time)
- [ ] Implement model retraining based on user feedback
- [ ] Add multi-device profile management
- [ ] Implement federated learning for privacy
- [ ] Add biometric fusion (face, voice, etc.)

## 🐛 Troubleshooting

**ML Service not starting:**

- Check Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Verify port 5000 is not in use

**Backend connection error:**

- Ensure MongoDB is running
- Check `.env` file exists with correct values
- Verify port 8080 is available

**Frontend not displaying trust score:**

- Check browser console for errors
- Verify backend URL in `.env.local`
- Ensure all services are running

**Trust score not updating:**

- Interact with the page (type, move mouse, click)
- Wait 5 seconds for next polling cycle
- Check if behavioral tracking is enabled

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributors

Built with ❤️ for secure continuous authentication
