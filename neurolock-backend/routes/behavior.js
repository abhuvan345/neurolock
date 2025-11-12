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
    const mlResp = await callMLService(userId, features);
    // expected { trust_score, action }
    const { trust_score, action } = mlResp;

    let status;
    if (action === "allow") status = "active";
    else if (action === "reauth") status = "warning";
    else if (action === "lockout") status = "locked";
    else status = "warning"; // fallback

    const session = await Session.create({
      userId,
      trustScore: trust_score,
      status,
      features,
    });

    if (status !== "active") {
      await Anomaly.create({
        sessionId: session._id,
        userId,
        summary: `System action: ${action}`,
      });
    }

    return res.json({ trust_score, action });
  } catch (err) {
    console.error("Behavior error:", err);
    return res.status(500).json({ error: "ML Service or server error" });
  }
});

export default router;
