"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Key, Eye, EyeOff, Check, X, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiKeyStatus {
  hasApiKey: boolean
  apiKey: string | null
}

export default function ApiKeySettings() {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchApiKeyStatus()
  }, [])

  const fetchApiKeyStatus = async () => {
    try {
      const response = await fetch("/api/user/api-key")
      if (response.ok) {
        const data = await response.json()
        setApiKeyStatus(data)
      } else {
        throw new Error("Failed to fetch API key status")
      }
    } catch (error) {
      console.error("Error fetching API key status:", error)
      setError("Failed to load API key status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError("API key is required")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/user/api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("API key updated successfully!")
        setApiKey("")
        setShowApiKey(false)
        fetchApiKeyStatus()
        toast({
          title: "Success",
          description: "Your API key has been saved securely.",
        })
      } else {
        setError(data.error || "Failed to save API key")
      }
    } catch (error) {
      console.error("Error saving API key:", error)
      setError("Failed to save API key")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveApiKey = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/user/api-key", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("API key removed successfully!")
        fetchApiKeyStatus()
        toast({
          title: "Success",
          description: "Your API key has been removed.",
        })
      } else {
        setError(data.error || "Failed to remove API key")
      }
    } catch (error) {
      console.error("Error removing API key:", error)
      setError("Failed to remove API key")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Settings
        </CardTitle>
        <CardDescription>
          Manage your OpenRouter API key to use AI features in the studio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API Key Status:</span>
          <Badge variant={apiKeyStatus?.hasApiKey ? "default" : "secondary"}>
            {apiKeyStatus?.hasApiKey ? "Configured" : "Not Set"}
          </Badge>
        </div>

        {/* Current API Key (masked) */}
        {apiKeyStatus?.hasApiKey && apiKeyStatus?.apiKey && (
          <div>
            <Label className="text-sm font-medium">Current API Key:</Label>
            <div className="mt-1 p-2 bg-muted rounded-md font-mono text-sm">
              {apiKeyStatus.apiKey}
            </div>
          </div>
        )}

        {/* API Key Input */}
        <div>
          <Label htmlFor="apiKey" className="text-sm font-medium">
            {apiKeyStatus?.hasApiKey ? "Update API Key:" : "Set API Key:"}
          </Label>
          <div className="mt-1 relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSaveApiKey}
            disabled={isSaving || !apiKey.trim()}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {apiKeyStatus?.hasApiKey ? "Update API Key" : "Save API Key"}
          </Button>
          {apiKeyStatus?.hasApiKey && (
            <Button
              variant="outline"
              onClick={handleRemoveApiKey}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Your API key is stored securely and used only for your AI requests.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Get your API key from:</span>
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              asChild
            >
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                OpenRouter.ai
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}