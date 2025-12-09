import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import OpenRouterService from "@/lib/openrouter"

interface WebAppRequest {
  prompt: string
  type: 'business' | 'blog' | 'portfolio' | 'ecommerce' | 'landing' | 'custom'
  features?: string[]
  framework?: 'react' | 'vue' | 'html' | 'next'
}

interface GeneratedApp {
  id: string
  name: string
  description: string
  files: Array<{
    name: string
    path: string
    content: string
    type: 'file' | 'directory'
  }>
  dependencies: string[]
  deployment: {
    vercel?: Record<string, any>
    netlify?: Record<string, any>
    coolify?: Record<string, any>
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt, type, features, framework }: WebAppRequest = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Get user's OpenRouter API key
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { openRouterApiKey: true }
    })

    if (!user?.openRouterApiKey) {
      return NextResponse.json({ 
        error: "API key required",
        message: "Please set up your OpenRouter API key to use AI features"
      }, { status: 400 })
    }

    const openRouter = new OpenRouterService({
      apiKey: user.openRouterApiKey
    })

    // Generate web app based on type and prompt
    const generatedApp = await generateWebApp(openRouter, {
      prompt,
      type: type || 'custom',
      features: features || [],
      framework: framework || 'react'
    })

    return NextResponse.json({ 
      success: true,
      app: generatedApp
    })

  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json({ error: "Failed to generate web app" }, { status: 500 })
  }
}

async function generateWebApp(aiService: OpenRouterService, options: {
  prompt: string
  type: string
  features: string[]
  framework: string
}): Promise<GeneratedApp> {
  const systemPrompt = `You are an expert web development AI agent. Generate a complete ${options.framework} web application based on the user's requirements.

Type: ${options.type}
Framework: ${options.framework}
Features: ${options.features.join(', ')}

Generate:
1. Complete file structure with proper organization
2. All necessary components and pages
3. Styling with modern CSS/Tailwind
4. Responsive design
5. Interactive elements where appropriate
6. Proper package.json with dependencies

Return a JSON response with:
{
  "name": "App Name",
  "description": "Brief description",
  "files": [
    {
      "name": "file.js",
      "path": "src/file.js", 
      "content": "file content",
      "type": "file"
    }
  ],
  "dependencies": ["dependency1", "dependency2"],
  "deployment": {
    "vercel": { "framework": "${options.framework}" },
    "netlify": { "buildCommand": "npm run build", "publishDir": "dist" },
    "coolify": { "dockerfile": true, "buildCommand": "npm run build" }
  }
}

Make the files production-ready with proper error handling, loading states, and best practices.`

  const messages = [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: `Create a ${options.type} website: ${options.prompt}`
    }
  ]

  const response = await aiService.chatCompletion(messages, 'anthropic/claude-3-sonnet')
  
  try {
    const generated = JSON.parse(response.response)
    return {
      id: `app_${Date.now()}`,
      name: generated.name || `${options.type} Website`,
      description: generated.description || `AI-generated ${options.type} website`,
      files: generated.files || [],
      dependencies: generated.dependencies || [],
      deployment: generated.deployment || {}
    }
  } catch (error) {
    console.error("Failed to parse AI response:", error)
    // Fallback to basic template
    return getBasicTemplate(options.type, options.prompt)
  }
}

function getBasicTemplate(type: string, prompt: string): GeneratedApp {
  const templates = {
    business: {
      name: "Business Website",
      description: `Business website for: ${prompt}`,
      files: [
        {
          name: "index.html",
          path: "index.html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt} - Business</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <header class="bg-white shadow">
        <div class="container mx-auto px-4 py-4">
            <h1 class="text-2xl font-bold">${prompt}</h1>
        </div>
    </header>
    <main class="container mx-auto px-4 py-8">
        <section class="text-center">
            <h2 class="text-3xl font-bold mb-4">Welcome to ${prompt}</h2>
            <p class="text-gray-600 mb-8">Your trusted partner for excellence</p>
            <button class="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">Get Started</button>
        </section>
    </main>
    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2024 ${prompt}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
          type: "file"
        }
      ],
      dependencies: [],
      deployment: {
        vercel: { framework: "html" },
        netlify: { buildCommand: "echo 'No build needed'", "publishDir": "." },
        coolify: { dockerfile: false }
      }
    },
    blog: {
      name: "Blog Website",
      description: `Blog about: ${prompt}`,
      files: [
        {
          name: "index.html",
          path: "index.html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt} - Blog</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <header class="bg-white shadow">
        <div class="container mx-auto px-4 py-4">
            <h1 class="text-2xl font-bold">${prompt} Blog</h1>
        </div>
    </header>
    <main class="container mx-auto px-4 py-8">
        <article class="max-w-3xl mx-auto">
            <h2 class="text-3xl font-bold mb-4">Welcome to My Blog</h2>
            <p class="text-gray-600 mb-4">Sharing thoughts and ideas about ${prompt}.</p>
            <div class="bg-white p-6 rounded shadow mb-6">
                <h3 class="text-xl font-semibold mb-2">Latest Post</h3>
                <p class="text-gray-700">This is where your latest blog content will appear...</p>
            </div>
        </article>
    </main>
    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2024 ${prompt} Blog. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
          type: "file"
        }
      ],
      dependencies: [],
      deployment: {
        vercel: { framework: "html" },
        netlify: { buildCommand: "echo 'No build needed'", "publishDir": "." },
        coolify: { dockerfile: false }
      }
    }
  }

  return templates[type as keyof typeof templates] || templates.business
}