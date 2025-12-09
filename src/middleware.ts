import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes that don't need authentication
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname.startsWith('/api/workspaces') ||
      request.nextUrl.pathname.startsWith('/api/projects') ||
      request.nextUrl.pathname.startsWith('/api/ai') ||
      request.nextUrl.pathname.startsWith('/preview/')) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  if (!token && request.nextUrl.pathname.startsWith('/studio')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}