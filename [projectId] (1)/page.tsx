'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  Terminal, 
  Globe, 
  Settings,
  ChevronRight,
  ChevronDown,
  Download,
  Rocket,
  Bot,
  Eye,
  Edit3,
  Code,
  Palette,
  Wand2
} from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@/components/MonacoEditor'), { ssr: false })
const XtermTerminal = dynamic(() => import('@/components/XtermTerminal'), { ssr: false })
const AIAssistant = dynamic(() => import('@/components/AIAssistant'), { ssr: false })
const VisualEditor = dynamic(() => import('@/components/VisualEditor'), { ssr: false })

interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  content?: string
  children?: FileNode[]
}

interface Project {
  id: string
  name: string
  slug: string
  workspaceId: string
}

export default function WorkspacePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showVisual, setShowVisual] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'code' | 'visual'>('code')

  useEffect(() => {
    if (session?.user && params.projectId) {
      fetchProject()
      fetchFiles()
    }
  }, [session, params.projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      toast.error('Failed to fetch project')
    }
  }

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/projects/${params.projectId}/files`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      toast.error('Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }

  const createFile = async (parentId?: string, name?: string) => {
    const fileName = name || prompt('Enter file name:')
    if (!fileName) return

    try {
      const response = await fetch(`/api/projects/${params.projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: fileName,
          type: 'file',
          parentId 
        })
      })

      if (response.ok) {
        fetchFiles()
        toast.success('File created successfully')
      }
    } catch (error) {
      toast.error('Failed to create file')
    }
  }

  const createFolder = async (parentId?: string) => {
    const folderName = prompt('Enter folder name:')
    if (!folderName) return

    try {
      const response = await fetch(`/api/projects/${params.projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: folderName,
          type: 'directory',
          parentId 
        })
      })

      if (response.ok) {
        fetchFiles()
        toast.success('Folder created successfully')
      }
    } catch (error) {
      toast.error('Failed to create folder')
    }
  }

  const saveFile = async (content: string) => {
    if (!selectedFile) return

    try {
      const response = await fetch(`/api/projects/${params.projectId}/files/${selectedFile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        toast.success('File saved successfully')
      }
    } catch (error) {
      toast.error('Failed to save file')
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/projects/${params.projectId}/files/${fileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchFiles()
        if (selectedFile?.id === fileId) {
          setSelectedFile(null)
        }
        toast.success('File deleted successfully')
      }
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  const exportProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.projectId}/multi-export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formats: ['zip', 'html', 'css', 'js'],
          options: {
            minify: true,
            includeDependencies: true,
            inlineAssets: true
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Download all formats
        Object.entries(data.exports).forEach(([format, content]) => {
          if (format === 'zip') {
            const blob = new Blob([atob(content)], { type: 'application/zip' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${project?.name || 'project'}.zip`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          } else if (format === 'html') {
            const blob = new Blob([content], { type: 'text/html' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${project?.name || 'project'}.html`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          } else if (format === 'css') {
            const blob = new Blob([content], { type: 'text/css' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${project?.name || 'project'}.css`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          } else if (format === 'js') {
            const blob = new Blob([content], { type: 'application/javascript' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${project?.name || 'project'}.js`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          }
        })
        
        toast.success('Project exported successfully')
      }
    } catch (error) {
      toast.error('Failed to export project')
    }
  }

  const deployProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.projectId}/platform-deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'vercel',
          options: {
            environment: 'production',
            buildCommand: 'npm run build',
            outputDirectory: '.next'
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Deployment started! Check logs for progress.')
      }
    } catch (error) {
      toast.error('Failed to start deployment')
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-muted cursor-pointer rounded ${
            selectedFile?.id === node.id ? 'bg-muted' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleFolder(node.id)
            } else {
              setSelectedFile(node)
            }
          }}
        >
          {node.type === 'directory' ? (
            expandedFolders.has(node.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : null}
          
          {node.type === 'directory' ? (
            expandedFolders.has(node.id) ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )
          ) : (
            <File className="h-4 w-4 text-gray-500" />
          )}
          
          <span className="flex-1 text-sm">{node.name}</span>
          
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            {node.type === 'directory' ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    createFile(node.id)
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    createFolder(node.id)
                  }}
                >
                  <Folder className="h-3 w-3" />
                </Button>
              </>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-500"
              onClick={(e) => {
                e.stopPropagation()
                deleteFile(node.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {node.type === 'directory' && expandedFolders.has(node.id) && node.children && (
          <div>{renderFileTree(node.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Project not found</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
            >
              ← Back
            </Button>
            <div>
              <h1 className="font-semibold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.slug}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={showTerminal ? "default" : "outline"}
              onClick={() => setShowTerminal(!showTerminal)}
            >
              <Terminal className="h-4 w-4 mr-2" />
              Terminal
            </Button>
            <Button 
              size="sm" 
              variant={showAI ? "default" : "outline"}
              onClick={() => setShowAI(!showAI)}
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button 
              size="sm" 
              variant={previewUrl ? "default" : "outline"}
              onClick={() => {
                if (previewUrl) {
                  setPreviewUrl(null)
                } else {
                  setPreviewUrl(`/preview/${params.projectId}`)
                }
              }}
            >
              <Globe className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={showTerminal ? 70 : 100}>
            <ResizablePanelGroup direction="horizontal">
              {/* File Explorer */}
              <ResizablePanel defaultSize={20} minSize={15}>
                <Card className="h-full rounded-none border-r">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Explorer</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => createFile()}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => createFolder()}
                        >
                          <Folder className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-8rem)]">
                      <div className="p-2">
                        {files.length === 0 ? (
                          <div className="text-center py-8">
                            <File className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <h3 className="text-lg font-medium mb-2">No files yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Create your first file to get started
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => createFile()}
                            >
                              Create your first file
                            </Button>
                          </div>
                        ) : (
                          renderFileTree(files)
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Editor Area */}
              <ResizablePanel defaultSize={previewUrl ? 50 : 80}>
                <Card className="h-full rounded-none">
                  {selectedFile ? (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4" />
                          <span className="font-medium">{selectedFile.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {selectedFile.path}
                          </Badge>
                        </div>
                        <Button size="sm" onClick={() => saveFile(selectedFile.content || '')}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                      <div className="flex-1">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                          <TabsList>
                            <TabsTrigger value="code">Code</TabsTrigger>
                            <TabsTrigger value="visual">Visual</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                    <div className="flex-1">
                      {activeTab === 'code' && selectedFile ? (
                        <MonacoEditor
                          value={selectedFile.content || ''}
                          onChange={(value) => {
                            setSelectedFile({ ...selectedFile, content: value || '' })
                          }}
                          language={selectedFile.name.endsWith('.js') ? 'javascript' : 
                                   selectedFile.name.endsWith('.ts') ? 'typescript' :
                                   selectedFile.name.endsWith('.jsx') ? 'javascript' :
                                   selectedFile.name.endsWith('.tsx') ? 'typescript' :
                                   selectedFile.name.endsWith('.html') ? 'html' :
                                   selectedFile.name.endsWith('.css') ? 'css' : 'plaintext'}
                        />
                      ) : activeTab === 'visual' ? (
                        <VisualEditor
                          elements={[]}
                          onElementsChange={(elements) => {
                            // Convert visual editor elements to file content
                            const fileContent = generateFileFromVisualElements(elements)
                            setSelectedFile({ ...selectedFile, content: fileContent })
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Edit3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">Select a file to edit</h3>
                          <p className="text-sm text-muted-foreground">
                            Choose a file from the explorer or create a new one to start editing
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Edit3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a file to edit</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a file from the explorer or create a new one to start editing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Preview Panel */}
              {previewUrl && (
                <ResizablePanel defaultSize={30} minSize={20}>
                  <Card className="h-full rounded-none">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Preview</CardTitle>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setPreviewUrl(null)}
                        >
                          ×
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="Preview"
                      />
                    </CardContent>
                  </Card>
                </ResizablePanel>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Bottom Panel - Terminal, AI Assistant, Export, Deploy */}
          <ResizablePanel defaultSize={0} minSize={0}>
            <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant={showTerminal ? "default" : "outline"}
                    onClick={() => setShowTerminal(!showTerminal)}
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    Terminal
                  </Button>
                  <Button 
                    size="sm" 
                    variant={showAI ? "default" : "outline"}
                    onClick={() => setShowAI(!showAI)}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    AI Assistant
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportProject}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={deployProject}>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

// Helper function to convert visual elements to file content
function generateFileFromVisualElements(elements: any[]): string {
  if (elements.length === 0) return '<!-- No visual elements yet -->'
  
  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
  html += '  <meta charset="UTF-8">\n'
  html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
  html += '  <title>Visual Editor Content</title>\n'
  html += '  <script src="https://cdn.tailwindcss.com"></script>\n'
  html += '</head>\n<body>\n'
  html += '  <div class="container mx-auto p-4">\n'
  
  elements.forEach(element => {
    switch (element.type) {
      case 'heading':
        html += `    <h1 style="font-size: ${element.styles.fontSize || '32px'}; color: ${element.styles.color || '#000'}; text-align: ${element.styles.textAlign || 'center'};">${element.content}</h1>\n`
        break
      case 'text':
        html += `    <p style="font-size: ${element.styles.fontSize || '16px'}; color: ${element.styles.color || '#000'};">${element.content}</p>\n`
        break
      case 'button':
        html += `    <button style="background-color: ${element.styles.backgroundColor || '#3b82f6'}; color: ${element.styles.color || '#fff'}; padding: ${element.styles.padding || '12px 24px'}; border-radius: ${element.styles.borderRadius || '6px'};">${element.content}</button>\n`
        break
      case 'image':
        html += `    <img src="${element.content}" alt="Visual element" style="max-width: 100%; height: auto;">\n`
        break
      case 'container':
        html += `    <div style="border: 2px dashed #d1d5db; padding: ${element.styles.padding || '16px'}; margin: ${element.styles.margin || '0'};">\n`
        if (element.children) {
          element.children.forEach((child: any) => {
            html += generateFileFromVisualElements([child])
          })
        }
        html += `    </div>\n`
        break
      case 'divider':
        html += `    <hr style="background-color: ${element.styles.color || '#d1d5db'}; height: 2px; border: none;">\n`
        break
      default:
        html += `    <div style="${Object.entries(element.styles || {}).map(([k, v]) => `${k}: ${v}`).join('; ')}">${element.content}</div>\n`
    }
  })
  
  html += '  </div>\n'
  html += '</body>\n</html>'
  
  return html
}