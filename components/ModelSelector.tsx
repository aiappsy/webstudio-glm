"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Bot, 
  Settings,
  Zap,
  Cpu,
  Brain
} from "lucide-react"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

const MODELS = {
  'deepseek/deepseek-r1:free': {
    name: 'DeepSeek R1 (Free)',
    description: 'Fast and efficient for general coding',
    icon: Cpu,
    speed: 'Fast',
    cost: 'Free'
  },
  'anthropic/claude-3-haiku': {
    name: 'Claude 3 Haiku',
    description: 'Fast and responsive for quick tasks',
    icon: Zap,
    speed: 'Very Fast',
    cost: 'Low'
  },
  'anthropic/claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    description: 'Balanced performance for coding',
    icon: Brain,
    speed: 'Balanced',
    cost: 'Medium'
  }
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          AI Model Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select AI Model:</label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an AI model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODELS).map(([key, model]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <model.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={model.cost === 'Free' ? 'default' : 'secondary'} className="text-xs">
                        {model.cost}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {model.speed}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Free Tier</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Performance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Creative</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>Tip:</strong> DeepSeek R1 is free and excellent for most coding tasks. 
          Claude models offer better reasoning but cost more per request.
        </div>
      </CardContent>
    </Card>
  )
}