// server.js
import { config } from "./config.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { connectDB } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import behaviorRoutes from "./routes/behavior.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
connectDB();

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/behavior", behaviorRoutes);

// Start server
const PORT = config.port;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
