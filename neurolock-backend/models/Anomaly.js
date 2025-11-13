// models/Anomaly.js
import mongoose from "mongoose";

const anomalySchema = new mongoose.Schema({
  sessionId: { type: String },
  userId: { type: String, required: true },
  summary: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Anomaly", anomalySchema);
