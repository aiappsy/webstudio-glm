"use client"

import { useEffect, useRef } from "react"
import * as monaco from "monaco-editor"

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  theme?: string
}

export default function MonacoEditor({ 
  value, 
  onChange, 
  language = "javascript", 
  theme = "vs-dark" 
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Configure Monaco
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editor.lineHighlightBackground': '#161b22',
        'editorCursor.foreground': '#58a6ff',
        'editorWhitespace.foreground': '#484f58',
      }
    })

    const editor = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme: 'custom-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      suggest: {
        showKeywords: true,
        showSnippets: true,
      },
    })

    editorInstanceRef.current = editor

    // Handle content changes
    const disposable = editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue()
      onChange(newValue)
    })

    return () => {
      disposable.dispose()
      editor.dispose()
    }
  }, [])

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorInstanceRef.current && value !== editorInstanceRef.current.getValue()) {
      editorInstanceRef.current.setValue(value)
    }
  }, [value])

  // Update language when it changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
    }
  }, [language])

  return <div ref={editorRef} className="h-full w-full" />
}