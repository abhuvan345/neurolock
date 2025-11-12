import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, features } = body

    // Extract only the 4 features required by the ML model
    const mlFeatures = {
      avg_key_interval: features.avg_key_interval || 0,
      mouse_speed: features.mouse_speed || 0,
      click_variance: features.click_variance || 0,
      nav_entropy: features.nav_entropy || 0,
    }

    console.log("[Frontend API] Sending to backend:", { userId, features: mlFeatures })

    // Call the Node.js backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
    
    // Get token from request headers or use a demo token
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.split(" ")[1] || "demo_token_for_testing"
    
    const response = await fetch(`${backendUrl}/api/behavior`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        features: mlFeatures,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error")
      console.error("[Frontend API] Backend error:", response.status, response.statusText)
      console.error("[Frontend API] Error details:", errorText)
      throw new Error(`Backend returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("[Frontend API] Backend response:", data)

    // Map action to status
    let status: "active" | "warning" | "locked" = "active"
    if (data.action === "allow") status = "active"
    else if (data.action === "reauth") status = "warning"
    else if (data.action === "lockout") status = "locked"

    const summary =
      status === "active"
        ? "Normal behavioral patterns detected"
        : status === "warning"
          ? "Unusual behavior detected. Increased verification may be required."
          : "Suspicious activity detected. Re-authentication required."

    return NextResponse.json(
      {
        trust_score: data.trust_score,
        status,
        summary,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Frontend API] Behavior analysis error:", error)

    // Fallback to mock data if backend is unavailable
    const mockScore = 85
    const mockStatus = "active"

    return NextResponse.json(
      {
        trust_score: mockScore,
        status: mockStatus,
        summary: "Running in offline mode - backend unavailable",
      },
      { status: 200 }
    )
  }
}
