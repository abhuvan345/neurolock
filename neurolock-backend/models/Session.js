// models/Session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  trustScore: { type: Number, required: true },
  status: { type: String, enum: ["active", "warning", "locked"], default: "active" },
  features: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Session", sessionSchema);
