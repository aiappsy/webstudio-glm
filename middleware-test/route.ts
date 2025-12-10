import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token')?.value
  
  return NextResponse.json({ 
    message: "Middleware test successful",
    hasToken: !!token,
    tokenValue: token || "none"
  })
}