import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("Debug - Test endpoint called")
    
    // Test database connection
    const { db } = await import("@/lib/db")
    const userCount = await db.user.count()
    console.log("Database user count:", userCount)
    
    // Test environment variables
    console.log("Environment check:", {
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET"
    })

    return NextResponse.json({ 
      message: "Debug test successful",
      userCount,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET"
      }
    })
  } catch (error) {
    console.error("Debug test error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}