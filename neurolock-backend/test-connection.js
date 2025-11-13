// test-connection.js
// Test script to verify backend and ML service connection

import fetch from "node-fetch";

const BASE_URL = "http://localhost:8080";
const ML_URL = "http://localhost:5000";

async function testMLService() {
  console.log("\n🧪 Testing ML Service directly...");
  try {
    const response = await fetch(`${ML_URL}/`);
    const data = await response.json();
    console.log("✅ ML Service health check:", data);

    // Test analyze endpoint
    const analyzeResponse = await fetch(`${ML_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "test_user",
        sample: {
          avg_key_interval: 0.28,
          mouse_speed: 118,
          click_variance: 0.19,
          nav_entropy: 0.81,
        },
      }),
    });
    const analyzeData = await analyzeResponse.json();
    console.log("✅ ML Service analyze response:", analyzeData);
  } catch (err) {
    console.error("❌ ML Service error:", err.message);
  }
}

async function testBackendHealth() {
  console.log("\n🧪 Testing Backend health...");
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log("✅ Backend health check:", data);
  } catch (err) {
    console.error("❌ Backend error:", err.message);
  }
}

async function testFullFlow() {
  console.log("\n🧪 Testing full flow (Backend -> ML Service)...");
  console.log("⚠️  Note: This requires a valid JWT token from login");
  console.log("    You'll need to register/login first to get a token");
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("🚀 NeuroLock Connection Test");
  console.log("=".repeat(60));

  await testBackendHealth();
  await testMLService();
  await testFullFlow();

  console.log("\n" + "=".repeat(60));
  console.log("✅ Connection tests completed!");
  console.log("=".repeat(60));
  console.log("\n📝 Next steps:");
  console.log(
    "1. Register a user: POST http://localhost:8080/api/auth/register"
  );
  console.log("2. Login: POST http://localhost:8080/api/auth/login");
  console.log("3. Send behavior data: POST http://localhost:8080/api/behavior");
  console.log("   (with Authorization header: Bearer <token>)");
}

runTests();
