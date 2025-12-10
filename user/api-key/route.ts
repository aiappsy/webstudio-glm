import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET user's API key (masked)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { openRouterApiKey: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Mask the API key for security
    const maskedKey = user.openRouterApiKey 
      ? `sk-${'*'.repeat(user.openRouterApiKey.length - 7)}${user.openRouterApiKey.slice(-7)}`
      : null

    return NextResponse.json({
      hasApiKey: !!user.openRouterApiKey,
      apiKey: maskedKey
    })
  } catch (error) {
    console.error("Get API key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST/PUT update user's API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { apiKey } = await request.json()

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Validate API key format (basic validation)
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { openRouterApiKey: apiKey },
      select: { id: true, email: true, name: true }
    })

    return NextResponse.json({
      message: "API key updated successfully",
      user: updatedUser
    })
  } catch (error) {
    console.error("Update API key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE remove user's API key
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { openRouterApiKey: null }
    })

    return NextResponse.json({
      message: "API key removed successfully"
    })
  } catch (error) {
    console.error("Delete API key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}