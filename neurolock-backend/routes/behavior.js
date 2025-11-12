// routes/behavior.js
import express from "express";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import Anomaly from "../models/Anomaly.js";
import { callMLService } from "../utils/mlClient.js";
import { config } from "../config.js";

const router = express.Router();
const JWT_SECRET = config.jwtSecret || "dev_secret_key";

// Auth middleware
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  const token = header.split(" ")[1];

  // Allow demo token for testing
  if (token === "demo_token_for_testing") {
    req.user = { id: "demo_user_001", email: "demo@neurolock.com" };
    return next();
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

router.post("/", authMiddleware, async (req, res) => {
  const { features } = req.body;
  if (!features) return res.status(400).json({ error: "Missing features" });

  const userId = req.user.id;

  try {
    // Extract only the 4 features required by the ML model
    const mlFeatures = {
      avg_key_interval: features.avg_key_interval || 0,
      mouse_speed: features.mouse_speed || 0,
      click_variance: features.click_variance || 0,
      nav_entropy: features.nav_entropy || 0,
    };

    console.log("📊 Sending to ML Service:", { userId, features: mlFeatures });

    const mlResp = await callMLService(userId, mlFeatures);
    // expected { trust_score, action }
    const { trust_score, action } = mlResp;

    console.log("🤖 ML Service response:", { trust_score, action });

    let status;
    if (action === "allow") status = "active";
    else if (action === "reauth") status = "warning";
    else if (action === "lockout") status = "locked";
    else status = "warning"; // fallback

    // Try to save to MongoDB, but don't fail if MongoDB is unavailable
    try {
      const session = await Session.create({
        userId,
        trustScore: trust_score,
        status,
        features: mlFeatures, // Store only the ML features
      });

      if (status !== "active") {
        await Anomaly.create({
          sessionId: String(session._id),
          userId,
          summary: `System action: ${action} (Trust Score: ${trust_score})`,
        });
      }
      console.log("✅ Session saved to MongoDB");
    } catch (dbErr) {
      console.warn("⚠️ MongoDB error (continuing anyway):", dbErr.message);
      // Continue even if MongoDB fails - still return ML results
    }

    return res.json({ trust_score, action });
  } catch (err) {
    console.error("❌ Behavior error:", err.message);
    return res.status(500).json({
      error: "ML Service or server error",
      details: err.message,
    });
  }
});

// Fetch recent activity logs for the current user
router.get("/logs", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const activities = sessions.map((s) => {
      const status = s.status || "active";
      const desc =
        status === "active"
          ? "Normal behavioral patterns detected"
          : status === "warning"
          ? "Unusual behavior detected. Increased verification may be required."
          : "Suspicious activity detected. Re-authentication required.";
      return {
        id: String(s._id),
        timestamp: new Date(s.createdAt).toISOString(),
        trustScore: s.trustScore,
        status,
        description: desc,
      };
    });

    return res.json({ activities });
  } catch (err) {
    console.warn("⚠️ Failed to fetch logs (continuing):", err.message);
    return res.json({ activities: [] });
  }
});

export default router;
