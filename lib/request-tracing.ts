import { NextRequest, NextResponse } from "next/server"

// Generate unique request ID for tracing
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Add request ID to request headers for tracing
function addRequestIdToHeaders(headers: Headers): Headers {
  const requestId = generateRequestId()
  headers.set('x-request-id', requestId)
  return headers
}

// Middleware for request tracing
export async function requestTracingMiddleware(request: NextRequest, next: () => Promise<NextResponse>): Promise<NextResponse> {
  const requestId = generateRequestId()
  const startTime = Date.now()
  
  // Add request ID to request headers for tracing
  const headers = addRequestIdToHeaders(request.headers)
  
  // Create response with tracing headers
  const response = await next()
  
  // Add tracing headers to response
  response.headers.set('x-request-id', requestId)
  response.headers.set('x-request-start-time', startTime.toString())
  response.headers.set('x-request-end-time', Date.now().toString())
  response.headers.set('x-request-duration', (Date.now() - startTime).toString())
  response.headers.set('x-user-agent', request.headers.get('user-agent') || 'unknown')
  response.headers.set('x-client-ip', request.ip || 'unknown')
  response.headers.set('x-forwarded-for', request.headers.get('x-forwarded-for') || 'unknown')
  response.headers.set('x-request-method', request.method)
  response.headers.set('x-request-path', request.url || 'unknown')
  response.headers.set('x-referer', request.headers.get('referer') || 'unknown')
  response.headers.set('x-accept-language', request.headers.get('accept-language') || 'unknown')
  response.headers.set('x-accept-encoding', request.headers.get('accept-encoding') || 'unknown')
  response.headers.set('x-content-type', request.headers.get('content-type') || 'unknown')
  response.headers.set('x-content-length', request.headers.get('content-length') || 'unknown')
  
  return response
}

export default requestTracingMiddleware