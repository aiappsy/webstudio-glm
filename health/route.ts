import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    await db.user.findFirst()
    
    // Check environment variables
    const envStatus = {
      database: process.env.DATABASE_URL ? 'connected' : 'not configured',
      nextauth: process.env.NEXTAUTH_SECRET ? 'configured' : 'not configured',
      openrouter: process.env.OPENROUTER_API_KEY ? 'configured' : 'not configured',
      nodeEnv: process.env.NODE_ENV || 'development',
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}