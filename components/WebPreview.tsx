"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Globe, RefreshCw, ExternalLink, Smartphone, Tablet, Monitor } from "lucide-react"
import { toast } from "sonner"

interface WebPreviewProps {
  projectId: string
}

export default function WebPreview({ projectId }: WebPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [viewportSize, setViewportSize] = useState("desktop")
  const [customUrl, setCustomUrl] = useState("")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const viewportSizes = {
    mobile: { width: "375px", height: "667px", label: "Mobile (iPhone)" },
    tablet: { width: "768px", height: "1024px", label: "Tablet (iPad)" },
    desktop: { width: "100%", height: "100%", label: "Desktop" }
  }

  useEffect(() => {
    // Set default preview URL
    setPreviewUrl(`/api/projects/${projectId}/preview`)
  }, [projectId])

  const refreshPreview = () => {
    setIsLoading(true)
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
    setTimeout(() => setIsLoading(false), 1000)
  }

  const openInNewTab = () => {
    window.open(previewUrl, "_blank")
  }

  const handleUrlChange = (url: string) => {
    setCustomUrl(url)
    if (url) {
      setPreviewUrl(url)
    } else {
      setPreviewUrl(`/api/projects/${projectId}/preview`)
    }
  }

  const currentViewport = viewportSizes[viewportSize as keyof typeof viewportSizes]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="font-medium">Web Preview</span>
          </div>
          <Badge variant="secondary">
            {currentViewport.label}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Custom URL..."
            value={customUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-64 text-sm"
          />
          
          <Select value={viewportSize} onValueChange={setViewportSize}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Desktop
                </div>
              </SelectItem>
              <SelectItem value="tablet">
                <div className="flex items-center gap-2">
                  <Tablet className="h-4 w-4" />
                  Tablet
                </div>
              </SelectItem>
              <SelectItem value="mobile">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button size="sm" variant="ghost" onClick={refreshPreview} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button size="sm" variant="ghost" onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 overflow-auto">
        <div className="flex justify-center">
          <div 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border"
            style={{
              width: currentViewport.width,
              height: currentViewport.height,
              maxWidth: "100%",
              maxHeight: "100%"
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Loading preview...</span>
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  toast.error("Failed to load preview")
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center gap-4">
          <span>URL: {previewUrl}</span>
          <span>Project: {projectId}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{currentViewport.width} × {currentViewport.height}</span>
          <span>Sandboxed</span>
        </div>
      </div>
    </div>
  )
}