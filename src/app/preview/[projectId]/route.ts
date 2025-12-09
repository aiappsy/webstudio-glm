import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify project belongs to user
    const project = await db.project.findFirst({
      where: { 
        id: params.projectId,
        workspace: { ownerId: session.user.id }
      },
      include: {
        files: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Generate simple HTML preview (in real app, this would be more sophisticated)
    const htmlFiles = project.files.filter(file => file.name.endsWith('.html'))
    const jsFiles = project.files.filter(file => file.name.endsWith('.js'))
    const cssFiles = project.files.filter(file => file.name.endsWith('.css'))

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Preview</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
    </style>
    ${cssFiles.map(file => `<style>${file.content}</style>`).join('\n')}
</head>
<body>
    <div class="container">
        <h1>${project.name}</h1>
        <p>Project preview for ${project.name}</p>
        <div id="app"></div>
    </div>
    ${jsFiles.map(file => `<script>${file.content}</script>`).join('\n')}
</body>
</html>`

    // If there's an index.html file, use that instead
    const indexHtml = htmlFiles.find(file => file.name === 'index.html')
    if (indexHtml) {
      html = indexHtml.content || html
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Error generating preview:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}