import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import JSZip from 'jszip'

interface ExportRequest {
  projectId: string
  formats: ('zip' | 'html' | 'css' | 'js' | 'elementor')[]
  options?: {
    minify?: boolean
    includeDependencies?: boolean
    inlineAssets?: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, formats, options }: ExportRequest = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    if (!formats || formats.length === 0) {
      return NextResponse.json({ error: "At least one export format is required" }, { status: 400 })
    }

    // Get project and files
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        workspace: {
          ownerId: session.user.id
        }
      },
      include: {
        files: {
          orderBy: {
            path: 'asc'
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Generate exports for each requested format
    const exports: Record<string, any> = {}

    for (const format of formats) {
      switch (format) {
        case 'zip':
          exports.zip = await generateZipExport(project.files, options)
          break
        case 'html':
          exports.html = await generateHtmlExport(project.files, options)
          break
        case 'css':
          exports.css = await generateCssExport(project.files, options)
          break
        case 'js':
          exports.js = await generateJsExport(project.files, options)
          break
        case 'elementor':
          exports.elementor = await generateElementorExport(project.files, options)
          break
      }
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug
      },
      exports,
      formats
    })

  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export project" }, { status: 500 })
  }
}

async function generateZipExport(files: any[], options?: any) {
  const zip = new JSZip()
  
  // Add all files to ZIP
  files.forEach(file => {
    if (file.type === 'directory') {
      // Create directory structure
      zip.folder(file.path)
    } else {
      // Add file content
      zip.file(file.path, file.content || '')
    }
  })

  // Add package.json if requested
  if (options?.includeDependencies) {
    const packageJson = {
      name: "exported-project",
      version: "1.0.0",
      dependencies: extractDependencies(files)
    }
    zip.file('package.json', JSON.stringify(packageJson, null, 2))
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
  return zipBuffer.toString('base64')
}

async function generateHtmlExport(files: any[], options?: any) {
  // Find the main HTML file or create one
  const htmlFile = files.find(f => f.name.endsWith('.html')) || files.find(f => f.name === 'index.html')
  const cssFiles = files.filter(f => f.name.endsWith('.css'))
  const jsFiles = files.filter(f => f.name.endsWith('.js'))

  let htmlContent = htmlFile?.content || generateDefaultHtml()

  // Inline CSS if requested
  if (options?.inlineAssets && cssFiles.length > 0) {
    const cssContent = cssFiles.map(f => f.content).join('\n')
    htmlContent = htmlContent.replace('</head>', `  <style>\n${cssContent}\n  </style>\n</head>`)
  }

  // Inline JS if requested
  if (options?.inlineAssets && jsFiles.length > 0) {
    const jsContent = jsFiles.map(f => f.content).join('\n')
    htmlContent = htmlContent.replace('</body>', `  <script>\n${jsContent}\n  </script>\n</body>`)
  }

  return htmlContent
}

async function generateCssExport(files: any[], options?: any) {
  const cssFiles = files.filter(f => f.name.endsWith('.css'))
  
  if (cssFiles.length === 0) {
    // Generate basic CSS from inline styles
    return generateBasicCss(files)
  }

  let cssContent = cssFiles.map(f => f.content).join('\n')

  if (options?.minify) {
    cssContent = minifyCss(cssContent)
  }

  return cssContent
}

async function generateJsExport(files: any[], options?: any) {
  const jsFiles = files.filter(f => f.name.endsWith('.js'))
  
  if (jsFiles.length === 0) {
    // Generate basic JS from HTML content
    return generateBasicJs(files)
  }

  let jsContent = jsFiles.map(f => f.content).join('\n')

  if (options?.minify) {
    jsContent = minifyJs(jsContent)
  }

  return jsContent
}

async function generateElementorExport(files: any[], options?: any) {
  // Convert to Elementor JSON format
  const htmlFile = files.find(f => f.name.endsWith('.html')) || files.find(f => f.name === 'index.html')
  const cssFiles = files.filter(f => f.name.endsWith('.css'))
  
  const elementorData = {
    version: '0.4',
    title: 'Exported Project',
    type: 'page',
    content: [
      {
        id: 'main-content',
        elType: 'section',
        settings: {
          structure: '20',
          background_background: 'classic',
          background_color: '#FFFFFF',
          padding_mobile: { unit: 'px', size: 20, sizes: [] },
          padding_tablet: { unit: 'px', size: 30, sizes: [] },
          padding: { unit: 'px', size: 40, sizes: [] },
          padding_unit: { unit: 'px', desktop: 'px', tablet: 'px', mobile: 'px' }
        },
        elements: [
          {
            id: 'heading',
            elType: 'heading',
            settings: {
              title: htmlFile ? extractTitleFromHtml(htmlFile.content) : 'Generated Page',
              header_size: 'h1',
              align: 'center',
              title_color: '#333333',
              typography_typography: 'Arial',
              typography_font_size: { unit: 'px', size: 32, sizes: [] }
            }
          },
          {
            id: 'text-editor',
            elType: 'text-editor',
            settings: {
              editor: htmlFile ? extractContentFromHtml(htmlFile.content) : 'Your content here...',
              text_color: '#333333',
              typography_typography: 'Arial',
              typography_font_size: { unit: 'px', size: 16, sizes: [] }
            }
          }
        ]
      }
    ],
    page_settings: {
      html_tag: 'section',
      background_background: 'classic',
      background_color: '#FFFFFF',
      padding_mobile: { unit: 'px', size: 20, sizes: [] },
      padding_tablet: { unit: 'px', size: 30, sizes: [] },
      padding: { unit: 'px', size: 40, sizes: [] },
      padding_unit: { unit: 'px', desktop: 'px', tablet: 'px', mobile: 'px' }
    }
  }

  return JSON.stringify(elementorData, null, 2)
}

// Helper functions
function extractDependencies(files: any[]): string[] {
  const deps = new Set<string>()
  
  files.forEach(file => {
    if (file.name === 'package.json') {
      try {
        const packageData = JSON.parse(file.content)
        Object.keys(packageData.dependencies || {}).forEach(dep => deps.add(dep))
      } catch (e) {
        console.warn('Failed to parse package.json:', e)
      }
    }
  })

  return Array.from(deps)
}

function generateDefaultHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <main class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8">Generated Website</h1>
        <p class="text-center text-gray-600">Your website content will appear here.</p>
    </main>
</body>
</html>`
}

function generateBasicCss(files: any[]): string {
  return `/* Generated CSS */
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Add more generated styles based on content */`
}

function generateBasicJs(files: any[]): string {
  return `// Generated JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Generated website loaded');
    
    // Add basic interactions
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Button clicked:', e.target);
        });
    });
});`
}

function extractTitleFromHtml(html: string): string {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i)
  return match ? match[1] : 'Generated Page'
}

function extractContentFromHtml(html: string): string {
  // Remove HTML tags and get content
  return html.replace(/<[^>]*>/g, '').trim()
}

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
    .trim()
}

function minifyJs(js: string): string {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
    .trim()
}