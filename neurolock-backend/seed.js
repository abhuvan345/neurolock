// seed.js
import dotenv from "dotenv";
dotenv.config(); // ✅ load env first, before anything else

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "./db.js";
import User from "./models/User.js";

const seed = async () => {
  await connectDB();

  const email = "user1@demo.com";
  const password = "neuro123";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("User already exists:", email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  const u = await User.create({ email, password: hashed });
  console.log("✅ Seeded user:", u.email, u._id.toString());
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
