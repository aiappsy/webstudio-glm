import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import OpenRouterService from "@/lib/openrouter"

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

    // Get OpenRouter API key from environment
    const openRouterKey = process.env.OPENROUTER_API_KEY
    if (!openRouterKey) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 })
    }

    const openRouter = new OpenRouterService({
      apiKey: openRouterKey
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