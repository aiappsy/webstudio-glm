import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    // Create a test user directly in the database
    const testUser = await db.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        email: "test@example.com",
        name: "Test User"
      }
    })

    // Create a test session token (this is just for testing)
    const testSession = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    return NextResponse.json({
      message: "Test user created",
      user: testUser,
      session: testSession,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Create test user error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}