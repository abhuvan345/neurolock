import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, password } = body

    // Demo password: neuro123
    if (password === "neuro123") {
      return NextResponse.json(
        {
          success: true,
          message: "Re-authentication successful",
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    )
  } catch (error) {
    console.error("[Re-auth API] Error:", error)
    return NextResponse.json(
      { error: "Re-authentication failed" },
      { status: 500 }
    )
  }
}
