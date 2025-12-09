import { test, expect } from '@playwright/test'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code, language, cursor, model } = await request.json()

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 })
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

    const completion = await openRouter.codeCompletion({
      code,
      language,
      cursor,
      model
    })

    return NextResponse.json({ completion })
  } catch (error) {
    console.error("Code completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}