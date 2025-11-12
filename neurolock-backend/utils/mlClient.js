// utils/mlClient.js
import fetch from "node-fetch";
import { config } from "../config.js";

export async function callMLService(userId, features) {
  const url = `${config.mlServiceUrl}/analyze`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        sample: features,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`ML service error (${res.status}): ${text}`);
    }
    return await res.json(); // expected { trust_score, action }
  } catch (err) {
    console.error("❌ ML Service connection error:", err.message);
    throw new Error(`Failed to connect to ML service: ${err.message}`);
  }
}
