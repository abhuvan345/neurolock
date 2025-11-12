// utils/mlClient.js
import fetch from "node-fetch";

export async function callMLService(userId, features) {
  const res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      sample: features
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("ML service error: " + text);
  }
  return await res.json(); // expected { trust_score, action }
}
