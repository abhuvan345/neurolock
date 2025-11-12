// models/Session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  // Store as string to support demo/test IDs without requiring a User ObjectId
  userId: { type: String, required: true },
  trustScore: { type: Number, required: true },
  status: {
    type: String,
    enum: ["active", "warning", "locked"],
    default: "active",
  },
  features: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", sessionSchema);
