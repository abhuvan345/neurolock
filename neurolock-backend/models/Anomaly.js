// models/Anomaly.js
import mongoose from "mongoose";

const anomalySchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  summary: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Anomaly", anomalySchema);
