"use client"

import { useState, useEffect, useRef } from "react"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, Download, Copy } from "lucide-react"
import { toast } from "sonner"

interface FileNode {
  id: string
  name: string
  path: string
  type: "file" | "directory"
  content?: string
  children?: FileNode[]
}

interface CodeEditorProps {
  file: FileNode
  onSave: (fileId: string, content: string) => void
}

export default function CodeEditor({ file, onSave }: CodeEditorProps) {
  const [content, setContent] = useState(file.content || "")
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    setContent(file.content || "")
    setHasChanges(false)
  }, [file])

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || ""
    setContent(newContent)
    setHasChanges(newContent !== (file.content || ""))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(file.id, content)
      setHasChanges(false)
      toast.success("File saved successfully")
    } catch (error) {
      toast.error("Failed to save file")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success("Content copied to clipboard")
  }

  const getLanguage = () => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'html':
        return 'html'
      case 'css':
        return 'css'
      case 'scss':
        return 'scss'
      case 'sass':
        return 'sass'
      case 'json':
        return 'json'
      case 'md':
        return 'markdown'
      case 'py':
        return 'python'
      case 'java':
        return 'java'
      case 'cpp':
      case 'cc':
      case 'cxx':
        return 'cpp'
      case 'c':
        return 'c'
      case 'go':
        return 'go'
      case 'rs':
        return 'rust'
      case 'php':
        return 'php'
      case 'sql':
        return 'sql'
      case 'yaml':
      case 'yml':
        return 'yaml'
      case 'xml':
        return 'xml'
      case 'sh':
      case 'bash':
        return 'shell'
      default:
        return 'plaintext'
    }
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      wordWrap: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      // Quick action command
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{file.name}</span>
            {hasChanges && (
              <Badge variant="secondary" className="text-xs">
• Unsaved
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {getLanguage()}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            title="Copy content"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            title="Save file (Ctrl+S)"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage()}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            wordWrap: 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: 'selection',
            rulers: [80, 120],
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
            }
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-4">
          <span>Lines: {content.split('\n').length}</span>
          <span>Characters: {content.length}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{getLanguage()}</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  )
}