import { test, expect } from '@playwright/test'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages, model } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Get user's OpenRouter API key from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { openRouterApiKey: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.openRouterApiKey) {
      return NextResponse.json({ 
        error: "API key required",
        message: "Please set up your OpenRouter API key in settings to use AI features"
      }, { status: 400 })
    }

    const openRouter = new OpenRouterService({
      apiKey: user.openRouterApiKey
    })

    const response = await openRouter.chatCompletion(messages, model)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}