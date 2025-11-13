import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body || {}

    // Demo mode: accept any non-empty password, or match override if provided
    const demoPassword = process.env.NEXT_PUBLIC_DEMO_REAUTH_PASSWORD || "neuro123"

    if (typeof password === "string" && password.trim().length > 0) {
      if (!process.env.NEXT_PUBLIC_DEMO_REAUTH_PASSWORD || password === demoPassword) {
        return NextResponse.json(
          { success: true, message: "Re-authentication successful" },
          { status: 200 },
        )
      }
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("[Re-auth API] Error:", error)
    return NextResponse.json({ error: "Re-authentication failed" }, { status: 500 })
  }
}
