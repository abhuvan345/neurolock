// db.js
import mongoose from "mongoose";
import { config } from "./config.js";

const MONGO_URI = config.mongoUri;

export const connectDB = async () => {
  if (!MONGO_URI) {
    console.warn(
      "⚠️  MONGO_URI not found. Starting server without database connection."
    );
    return; // Allow app to run without DB (useful for demo/local)
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (err) {
    console.warn(
      "⚠️  MongoDB connection failed (continuing without DB):",
      err.message
    );
    // Do not exit; API can still operate in degraded mode
  }
};
