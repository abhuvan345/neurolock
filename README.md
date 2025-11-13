# 🔐 **NeuroLock — Adaptive Behavioral Continuous Authentication System**

---

## 👥 **Team Name**

**The Future Creators**

---

## 👩‍💻 **Team Members**

* **Abhay K R** – [abhaykr.ai23@bmsce.ac.in](mailto:abhaykr.ai23@bmsce.ac.in)
* **Ankith Krishna Bhargav** – [ankithkrishna.ai23@bmsce.ac.in](mailto:ankithkrishna.ai23@bmsce.ac.in)
* **Bhuvan A** – [bhuvana.cs24@bmsce.ac.in](mailto:bhuvana.cs24@bmsce.ac.in)
* **Akshay S** – [akshays.cs23@bmsce.ac.in](mailto:akshays.cs23@bmsce.ac.in)

---

## 💡 **Project Title**

**NeuroLock – AI-Powered Adaptive Behavioral Authentication System**

---

## 📘 **Short Project Summary**

**NeuroLock** is a next‑generation **continuous authentication platform** that verifies a user’s identity based on **behavioral biometrics** instead of relying solely on static passwords or OTPs.

It continuously monitors:
 ✔ Keystroke dynamics
 ✔ Mouse movement patterns
 ✔ Idle-time behavior **(micro‑behaviors)**
 ✔ Navigation patterns
 ✔ Device fingerprint and environmental signals

These signals are processed using a **Python ML model** that returns a real‑time **trust score**, which the Node.js backend uses to determine whether the user should stay logged in, be challenged, or logged out.

**Why this matters:** passwords can be leaked, OTPs can be intercepted — but behavioral patterns are **unique**, extremely hard to fake, and continuously verifiable.

Built using **Next.js (Frontend)**, **Node.js + Express (Backend)**, **Python ML Service**, and **MongoDB**, NeuroLock provides an enterprise‑grade behavioral authentication experience.

---

## 🧠 **What the Project Does**

* Captures **real-time behavioral telemetry** from the user’s browser
* Converts raw telemetry into meaningful **behavioral features**
* Sends features to a **machine learning model** for trust prediction
* Continuously authenticates the logged‑in user every few seconds
* Issues **step-up authentication** when suspicious activity is detected
* Maintains logs, trust history, and session data in MongoDb

---

## 🙌 **Why This Project is Useful**

* Prevents **account takeovers**, **session hijacking**, and **credential misuse**
* Provides a **frictionless security experience** (no repetitive OTPs)
* Enhances security for high‑risk platforms (banking, healthcare, exams)
* Hard to spoof or replicate since it learns each user’s behavior baseline
* Lightweight, fast, and deployable anywhere

---

## 🛠️ **Tools / Technologies Used**

* **Frontend:** Next.js, React.js, Tailwind, WebSockets
* **Backend:** Node.js, Express.js
* **ML Service:** Python, FastAPI, Scikit‑learn, Pandas, Joblib
* **Database:** MongoDB
* **Communication:** REST API + WebSockets
* **Security:** JWT, CORS, Behavior-Based Trust Evaluation

---

## ⚙️ **Instructions to Run the Project**

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Akshays-2005/NeuroLock
cd Neurolock
```

### 2️⃣ Start the ML Microservice

```bash
cd ml-service
pip install -r requirements.txt
python server.py
```

🔗 **Runs on:** [http://localhost:5000](http://localhost:5000)

### 3️⃣ Start the Backend Server

```bash
cd backend
npm install
node server.js
```

🔗 **Runs on:** [http://localhost:4000](http://localhost:4000)

### 4️⃣ Start the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

🔗 **Runs on:** [http://localhost:3000](http://localhost:3000)

---

## 🧩 **Core Features**

* 🔐 **Continuous Authentication** using behavioral biometrics
* 🧠 **ML‑driven trust score** engine (0–1 scale)
* 📡 Real‑time telemetry capture (mouse, keyboard, idle)
* 📈 Trust history graph and admin monitoring panel
* ⚠️ Automatic **step-up authentication triggers** on anomalies
* 🌐 Secure API communication with CORS + JWT
* 🗄️ Lightweight MongoDb storage

---

## 🎨 **Theme & Design**

* **Tagline:** “Security that adapts to you.”
* **Logo Concept:** A neural fingerprint + shield
* **Color Palette:**

  * Midnight Black `#0A0A0A`
  * Electric Purple `#8B5CF6`
  * Neon Blue `#00D4FF`
  * Soft Gray `#E5E7EB`
* **Vibe:** Futuristic · Secure · AI‑Driven

---

## 🚀 **Future Scope**

* Advanced anomaly detection using LSTM behavioral models
* Multi-device behavior profile syncing
* Enterprise dashboard for security teams
* Continuous learning from user-specific patterns
* Browser extension for cross‑site behavioral auth
* Zero-trust compatible access control engine

---

## 📚 **Where Users Can Get Help**

* Project documentation in the `/docs` folder
* Raise issues in the GitHub **Issues** tab
* Contact team via email
* Ask implementation doubts via Discussions

---

## 👨‍🔧 **Who Maintains & Contributes to the Project**

This project is maintained by **Team The Future Creators**.

Core contributors:

* **Abhay K R** – Integration Lead
* **Ankith Krishna Bhargav** – ML Lead
* **Bhuvan A** – Backend and Database
* **Akshay S** – Frontend

External contributors are welcome — open a PR! 🚀

---

### 🏁 **Built with Passion by Team The Future Creators 💜**
