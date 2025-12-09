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

    const { code, language, cursor, model } = await request.json()

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 })
    }

    // Get OpenRouter API key from environment
    const openRouterKey = process.env.OPENROUTER_API_KEY
    if (!openRouterKey) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 })
    }

    const openRouter = new OpenRouterService({
      apiKey: openRouterKey
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