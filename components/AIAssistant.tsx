"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MessageCircle, 
  Code, 
  Wand2, 
  Bug, 
  Send,
  Bot,
  User,
  Loader2,
  Settings,
  Key,
  AlertTriangle,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import ModelSelector from "./ModelSelector"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  projectId: string
  currentCode?: string
  currentLanguage?: string
  onCodeGenerated?: (code: string) => void
}

export default function AIAssistant({ projectId, currentCode, currentLanguage, onCodeGenerated }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'complete' | 'generate'>('chat')
  const [codePrompt, setCodePrompt] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [selectedModel, setSelectedModel] = useState(process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1:free')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<{ hasApiKey: boolean } | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkApiKeyStatus()
  }, [])

  const checkApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/user/api-key')
      if (response.ok) {
        const data = await response.json()
        setApiKeyStatus(data)
      }
    } catch (error) {
      console.error('Error checking API key status:', error)
    }
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleApiError = (error: any) => {
    if (error?.error === "API key required") {
      toast.error("API key required. Please set up your OpenRouter API key in settings.")
    } else {
      toast.error(error?.error || "AI request failed")
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: selectedModel
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        const error = await response.json()
        handleApiError(error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error communicating with AI')
    } finally {
      setIsLoading(false)
    }
  }

  const generateCode = async () => {
    if (!codePrompt.trim() || isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: codePrompt.trim(),
          language: currentLanguage,
          context: currentCode
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCode(data.code)
        onCodeGenerated?.(data.code)
        toast.success('Code generated successfully!')
      } else {
        const error = await response.json()
        handleApiError(error)
      }
    } catch (error) {
      console.error('Error generating code:', error)
      toast.error('Error generating code')
    } finally {
      setIsLoading(false)
    }
  }

  const completeCode = async () => {
    if (!currentCode || !currentLanguage || isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/code-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          language: currentLanguage
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCode(data.completion)
        onCodeGenerated?.(data.completion)
        toast.success('Code completion generated!')
      } else {
        const error = await response.json()
        handleApiError(error)
      }
    } catch (error) {
      console.error('Error completing code:', error)
      toast.error('Error completing code')
    } finally {
      setIsLoading(false)
    }
  }

  // Show API key setup prompt if no API key is configured
  if (apiKeyStatus && !apiKeyStatus.hasApiKey) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <div className="flex-1 p-6">
            <Alert className="mb-4">
              <Key className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="font-medium">API Key Required</div>
                <div className="text-sm">
                  To use AI features, you need to set up your OpenRouter API key.
                </div>
                <div className="flex items-center gap-2 text-sm">
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
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Your API key is:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Stored securely and encrypted</li>
                  <li>Used only for your AI requests</li>
                  <li>Never shared with other users</li>
                  <li>Required for chat, code completion, and generation</li>
                </ul>
              </div>

              <div className="text-sm">
                <p className="font-medium mb-1">How to get your API key:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Sign up at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary underline">OpenRouter.ai</a></li>
                  <li>Navigate to the API Keys section</li>
                  <li>Create a new API key</li>
                  <li>Copy and paste it in the settings</li>
                </ol>
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  After setting up your API key, AI features will be available here.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              OpenRouter.ai
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowModelSelector(!showModelSelector)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <div className="flex h-full">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chat' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'complete' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('complete')}
            >
              <Code className="h-4 w-4 mr-2" />
              Complete
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'generate' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('generate')}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex">
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col">
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-primary-foreground" />
                          ) : (
                            <Bot className="h-4 w-4 text-secondary-foreground" />
                          )}
                        </div>
                        <div className={`flex-1 rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-primary/10 ml-auto max-w-[80%]' 
                            : 'bg-muted max-w-[80%]'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                </ScrollArea>

                <Separator />

                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask AI anything about your code..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={isLoading || !input.trim()}
                      size="sm"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'complete' && (
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Code Completion</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Get AI-powered code completion based on your current code
                    </p>
                    <Button 
                      onClick={completeCode} 
                      disabled={isLoading || !currentCode}
                      className="w-full"
                      variant="outline"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Code className="h-4 w-4 mr-2" />
                      )}
                      Complete Current Code
                    </Button>
                  </div>

                  {generatedCode && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Generated Completion</h3>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                        <code>{generatedCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'generate' && (
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Generate Code</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Describe what you want to create and AI will generate it
                    </p>
                    <Textarea
                      value={codePrompt}
                      onChange={(e) => setCodePrompt(e.target.value)}
                      placeholder="e.g., Create a React component for a user profile card with avatar and details..."
                      className="min-h-[100px] mb-4"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={generateCode} 
                      disabled={isLoading || !codePrompt.trim()}
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Generate Code
                    </Button>
                  </div>

                  {generatedCode && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Generated Code</h3>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                        <code>{generatedCode}</code>
                      </pre>
                      <Button 
                        onClick={() => onCodeGenerated?.(generatedCode)}
                        className="w-full mt-2"
                        variant="outline"
                        size="sm"
                      >
                        Use This Code
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}