'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Wand2, 
  Zap, 
  Code, 
  Globe, 
  ShoppingCart, 
  Briefcase, 
  User, 
  Star,
  Download,
  Rocket,
  Settings,
  Eye
} from 'lucide-react'

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

interface AIGeneratorProps {
  onAppGenerated: (app: GeneratedApp) => void
  onEditVisually: (app: GeneratedApp) => void
  onExportProject: (app: GeneratedApp) => void
}

const APP_TYPES = [
  { 
    value: 'business', 
    label: 'Business Website', 
    description: 'Professional business website with services, about, and contact sections',
    icon: Briefcase,
    features: ['Contact Form', 'Services Section', 'About Us', 'Testimonials']
  },
  { 
    value: 'blog', 
    label: 'Blog', 
    description: 'Personal or professional blog with posts, categories, and comments',
    icon: User,
    features: ['Blog Posts', 'Categories', 'Search', 'Comments']
  },
  { 
    value: 'portfolio', 
    label: 'Portfolio', 
    description: 'Showcase your work with projects gallery and skills section',
    icon: Star,
    features: ['Project Gallery', 'Skills Section', 'Contact Form', 'Resume Download']
  },
  { 
    value: 'ecommerce', 
    label: 'E-commerce Store', 
    description: 'Online store with products, cart, and checkout functionality',
    icon: ShoppingCart,
    features: ['Product Catalog', 'Shopping Cart', 'Checkout', 'Payment Integration']
  },
  { 
    value: 'landing', 
    label: 'Landing Page', 
    description: 'High-converting landing page with CTA and lead capture',
    icon: Rocket,
    features: ['Hero Section', 'Call to Action', 'Lead Capture Form', 'Testimonials']
  },
  { 
    value: 'custom', 
    label: 'Custom', 
    description: 'Describe exactly what you want to build',
    icon: Code,
    features: []
  }
]

const FRAMEWORKS = [
  { value: 'react', label: 'React', description: 'Modern React application with components' },
  { value: 'next', label: 'Next.js', description: 'Full-stack React framework with SSR' },
  { value: 'vue', label: 'Vue.js', description: 'Progressive JavaScript framework' },
  { value: 'html', label: 'HTML/CSS/JS', description: 'Static HTML website with vanilla JavaScript' }
]

export default function AIGenerator({ onAppGenerated, onEditVisually, onExportProject }: AIGeneratorProps) {
  const { data: session } = useSession()
  const [step, setStep] = useState<'prompt' | 'generating' | 'review' | 'complete'>('prompt')
  const [prompt, setPrompt] = useState('')
  const [appType, setAppType] = useState('business')
  const [framework, setFramework] = useState('react')
  const [features, setFeatures] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to build')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setStep('generating')

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch('/api/ai/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: appType,
          features,
          framework
        })
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (response.ok) {
        const data = await response.json()
        setGeneratedApp(data.app)
        setStep('review')
        toast.success('Web app generated successfully!')
      } else {
        throw new Error('Failed to generate app')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate web app')
      setStep('prompt')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditVisually = () => {
    if (generatedApp) {
      onEditVisually(generatedApp)
    }
  }

  const handleExportProject = () => {
    if (generatedApp) {
      onExportProject(generatedApp)
    }
  }

  const selectedAppType = APP_TYPES.find(type => type.value === appType)

  if (!session) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Wand2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">AI Web App Generator</h2>
          <p className="text-muted-foreground mb-4">Please sign in to start creating amazing web applications with AI</p>
          <Button onClick={() => window.location.href = '/auth/signin'}>
            Sign In to Get Started
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === 'prompt') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-6 h-6" />
              AI Web App Generator
            </CardTitle>
            <CardDescription>
              Describe your dream website and let AI create it for you in seconds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* App Type Selection */}
              <div>
                <Label>What type of website?</Label>
                <Select value={appType} onValueChange={setAppType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Framework Selection */}
              <div>
                <Label>Preferred framework?</Label>
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAMEWORKS.map((fw) => (
                      <SelectItem key={fw.value} value={fw.value}>
                        <div>
                          <div className="font-medium">{fw.label}</div>
                          <div className="text-sm text-muted-foreground">{fw.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Features */}
            {selectedAppType && selectedAppType.features.length > 0 && (
              <div>
                <Label>Include these features (optional):</Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedAppType.features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={feature}
                        checked={features.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFeatures([...features, feature])
                          } else {
                            setFeatures(features.filter(f => f !== feature))
                          }
                        }}
                      />
                      <Label htmlFor={feature} className="text-sm">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <Label htmlFor="prompt">Describe your website</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to build. For example: 'I want a professional business website for my digital marketing agency with a hero section, services showcase, client testimonials, and contact form. The design should be modern and clean with a blue color scheme.'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="min-h-[120px]"
              />
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={!prompt.trim() || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Generate with AI
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'generating') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-xl font-semibold">AI is creating your website...</h3>
            <p className="text-muted-foreground">This usually takes 10-30 seconds</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${generationProgress >= 20 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <span className="text-sm">Analyzing requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${generationProgress >= 40 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <span className="text-sm">Generating structure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${generationProgress >= 60 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <span className="text-sm">Creating components</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${generationProgress >= 80 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <span className="text-sm">Adding styling</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${generationProgress >= 100 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <span className="text-sm">Finalizing</span>
              </div>
            </div>
            
            <Progress value={generationProgress} className="w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'review' && generatedApp) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              Your Generated Web App
            </CardTitle>
            <CardDescription>
              Review your AI-generated website and choose what to do next
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-green-700">Generation Complete!</span>
              </div>
              <h4 className="font-semibold mb-2">{generatedApp.name}</h4>
              <p className="text-sm text-muted-foreground mb-4">{generatedApp.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Files:</span>
                  <div className="text-2xl font-bold text-blue-600">{generatedApp.files.length}</div>
                </div>
                <div>
                  <span className="font-medium">Framework:</span>
                  <div className="text-lg font-semibold">{framework}</div>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <div className="text-lg font-semibold capitalize">{appType}</div>
                </div>
                <div>
                  <span className="font-medium">Dependencies:</span>
                  <div className="text-lg font-semibold">{generatedApp.dependencies.length}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleEditVisually} className="flex-1" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Visually
              </Button>
              <Button onClick={handleExportProject} className="flex-1" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Project
              </Button>
              <Button onClick={() => onAppGenerated(generatedApp)} className="flex-1">
                <Rocket className="w-4 h-4 mr-2" />
                Continue to Studio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}