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

    const { messages, model } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Get OpenRouter API key from environment
    const openRouterKey = process.env.OPENROUTER_API_KEY
    if (!openRouterKey) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 })
    }

    const openRouter = new OpenRouterService({
      apiKey: openRouterKey
    })

    const response = await openRouter.chatCompletion(messages, model)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}