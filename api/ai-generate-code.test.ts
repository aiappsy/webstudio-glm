import { test, expect } from '@playwright/test'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt, language, context, model } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
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

    const generatedCode = await openRouter.generateCode({
      prompt,
      language,
      context,
      model
    })

    return NextResponse.json({ code: generatedCode })
  } catch (error) {
    console.error("Code generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}