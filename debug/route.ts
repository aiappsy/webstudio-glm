import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    const userCount = await db.user.count()
    
    // Check environment variables
    const envStatus = {
      database: process.env.DATABASE_URL ? 'connected' : 'not configured',
      nextauth: process.env.NEXTAUTH_SECRET ? 'configured' : 'not configured',
      openrouter: process.env.OPENROUTER_API_KEY ? 'configured' : 'not configured',
      nodeEnv: process.env.NODE_ENV || 'development',
    }
    
    return NextResponse.json({
      message: "Debug test successful",
      userCount,
      env: envStatus
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}