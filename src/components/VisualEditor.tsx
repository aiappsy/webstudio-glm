'use client'

import React, { useState, useRef, useCallback } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Trash2, 
  Settings, 
  Type, 
  Image, 
  Layout,
  Palette,
  Save,
  Eye,
  Edit3,
  MousePointer
} from 'lucide-react'

interface VisualElement {
  id: string
  type: 'heading' | 'text' | 'button' | 'image' | 'container' | 'divider'
  content: string
  styles: {
    fontSize?: string
    color?: string
    backgroundColor?: string
    padding?: string
    margin?: string
    borderRadius?: string
    width?: string
    height?: string
    textAlign?: 'left' | 'center' | 'right'
    fontWeight?: string
    [key: string]: any
  }
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  children?: VisualElement[]
}

interface VisualEditorProps {
  elements: VisualElement[]
  onElementsChange: (elements: VisualElement[]) => void
  onPreview?: () => void
  onSave?: () => void
}

const DraggableElement: React.FC<{
  element: VisualElement
  index: number
  onSelect: (element: VisualElement) => void
  onUpdate: (element: VisualElement) => void
  onDelete: (elementId: string) => void
}> = ({ element, index, onSelect, onUpdate, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'element',
    item: { element, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, drop] = useDrop({
    accept: 'element',
    drop: (item: { element: VisualElement, index: number }) => {
      if (item.index !== index) {
        // Handle reordering
        return { moved: true }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const renderElement = () => {
    const baseStyles = {
      ...element.styles,
      position: 'absolute' as const,
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.position.width}px`,
      height: `${element.position.height}px`,
      cursor: 'move',
      border: isDragging ? '2px dashed #3b82f6' : isOver ? '2px dashed #10b981' : '1px solid transparent',
      borderRadius: element.styles.borderRadius || '4px',
      backgroundColor: element.styles.backgroundColor || 'transparent',
      color: element.styles.color || '#000000',
      fontSize: element.styles.fontSize || '16px',
      padding: element.styles.padding || '8px 16px',
      margin: element.styles.margin || '0',
      textAlign: element.styles.textAlign || 'left',
      fontWeight: element.styles.fontWeight || 'normal'
    }

    switch (element.type) {
      case 'heading':
        return (
          <h1 style={baseStyles}>
            {element.content}
          </h1>
        )
      case 'text':
        return (
          <p style={baseStyles}>
            {element.content}
          </p>
        )
      case 'button':
        return (
          <button 
            style={{
              ...baseStyles,
              border: '1px solid #d1d5db',
              cursor: 'pointer'
            }}
          >
            {element.content}
          </button>
        )
      case 'image':
        return (
          <img 
            src={element.content} 
            alt="Visual element"
            style={baseStyles}
          />
        )
      case 'container':
        return (
          <div 
            style={{
              ...baseStyles,
              border: '2px dashed #d1d5db',
              minHeight: '100px'
            }}
          >
            {element.children?.map((child, childIndex) => (
              <DraggableElement
                key={child.id}
                element={child}
                index={childIndex}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        )
      case 'divider':
        return (
          <hr 
            style={{
              ...baseStyles,
              height: '2px',
              backgroundColor: element.styles.color || '#d1d5db',
              border: 'none'
            }}
          />
        )
      default:
        return (
          <div style={baseStyles}>
            {element.content}
          </div>
        )
    }
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={() => onSelect(element)}
      className="hover:outline-2 hover:outline-blue-500 transition-all"
    >
      {renderElement()}
      {isDragging && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white p-1 rounded">
          <MousePointer className="w-4 h-4" />
        </div>
      )}
    </div>
  )
}

const ComponentLibrary: React.FC<{
  onAddElement: (type: VisualElement['type']) => void
}> = ({ onAddElement }) => {
  const components = [
    { type: 'heading', icon: Type, label: 'Heading', description: 'Add a heading element' },
    { type: 'text', icon: Type, label: 'Text', description: 'Add a text paragraph' },
    { type: 'button', icon: Plus, label: 'Button', description: 'Add a clickable button' },
    { type: 'image', icon: Image, label: 'Image', description: 'Add an image' },
    { type: 'container', icon: Layout, label: 'Container', description: 'Add a container for layout' },
    { type: 'divider', icon: Layout, label: 'Divider', description: 'Add a divider line' }
  ]

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Components
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {components.map((component) => (
          <Button
            key={component.type}
            variant="outline"
            className="w-full justify-start h-auto p-3"
            onClick={() => onAddElement(component.type)}
          >
            <component.icon className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">{component.label}</div>
              <div className="text-xs text-muted-foreground">{component.description}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

const PropertyPanel: React.FC<{
  selectedElement: VisualElement | null
  onUpdateElement: (element: VisualElement) => void
}> = ({ selectedElement, onUpdateElement }) => {
  if (!selectedElement) {
    return (
      <Card className="w-64">
        <CardContent className="p-4">
          <p className="text-muted-foreground text-center">Select an element to edit properties</p>
        </CardContent>
      </Card>
    )
  }

  const updateStyle = (property: string, value: any) => {
    onUpdateElement({
      ...selectedElement,
      styles: {
        ...selectedElement.styles,
        [property]: value
      }
    })
  }

  const updateContent = (content: string) => {
    onUpdateElement({
      ...selectedElement,
      content
    })
  }

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="content">Content</Label>
          <Input
            id="content"
            value={selectedElement.content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Element content"
          />
        </div>

        <div>
          <Label htmlFor="fontSize">Font Size</Label>
          <Select value={selectedElement.styles.fontSize || '16px'} onValueChange={(value) => updateStyle('fontSize', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12px">12px</SelectItem>
              <SelectItem value="14px">14px</SelectItem>
              <SelectItem value="16px">16px</SelectItem>
              <SelectItem value="18px">18px</SelectItem>
              <SelectItem value="20px">20px</SelectItem>
              <SelectItem value="24px">24px</SelectItem>
              <SelectItem value="32px">32px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color">Text Color</Label>
          <Input
            id="color"
            type="color"
            value={selectedElement.styles.color || '#000000'}
            onChange={(e) => updateStyle('color', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="backgroundColor">Background Color</Label>
          <Input
            id="backgroundColor"
            type="color"
            value={selectedElement.styles.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="textAlign">Text Align</Label>
          <Select value={selectedElement.styles.textAlign || 'left'} onValueChange={(value) => updateStyle('textAlign', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="padding">Padding</Label>
          <Input
            id="padding"
            value={selectedElement.styles.padding || '8px 16px'}
            onChange={(e) => updateStyle('padding', e.target.value)}
            placeholder="8px 16px"
          />
        </div>

        <div>
          <Label htmlFor="margin">Margin</Label>
          <Input
            id="margin"
            value={selectedElement.styles.margin || '0'}
            onChange={(e) => updateStyle('margin', e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="borderRadius">Border Radius</Label>
          <Input
            id="borderRadius"
            value={selectedElement.styles.borderRadius || '4px'}
            onChange={(e) => updateStyle('borderRadius', e.target.value)}
            placeholder="4px"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              value={selectedElement.position.width.toString()}
              onChange={(e) => {
                const width = parseInt(e.target.value) || 200
                onUpdateElement({
                  ...selectedElement,
                  position: { ...selectedElement.position, width }
                })
              }}
              placeholder="200"
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              value={selectedElement.position.height.toString()}
              onChange={(e) => {
                const height = parseInt(e.target.value) || 100
                onUpdateElement({
                  ...selectedElement,
                  position: { ...selectedElement.position, height }
                })
              }}
              placeholder="100"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VisualEditor({ elements, onElementsChange, onPreview, onSave }: VisualEditorProps) {
  const [selectedElement, setSelectedElement] = useState<VisualElement | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleAddElement = useCallback((type: VisualElement['type']) => {
    const newElement: VisualElement = {
      id: `element_${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: {
        x: 50,
        y: 50,
        width: 200,
        height: 100
      }
    }

    onElementsChange([...elements, newElement])
    setSelectedElement(newElement)
  }, [elements, onElementsChange])

  const handleUpdateElement = useCallback((updatedElement: VisualElement) => {
    onElementsChange(elements.map(el => el.id === updatedElement.id ? updatedElement : el))
  }, [elements, onElementsChange])

  const handleDeleteElement = useCallback((elementId: string) => {
    onElementsChange(elements.filter(el => el.id !== elementId))
    if (selectedElement?.id === elementId) {
      setSelectedElement(null)
    }
  }, [elements, onElementsChange, selectedElement])

  const getDefaultContent = (type: VisualElement['type']): string => {
    switch (type) {
      case 'heading': return 'Your Heading'
      case 'text': return 'Your text content goes here. This is a paragraph that can contain multiple sentences and provide detailed information about your topic.'
      case 'button': return 'Click Me'
      case 'image': return 'https://via.placeholder.com/300x200'
      case 'container': return 'Container'
      case 'divider': return ''
      default: return 'Element'
    }
  }

  const getDefaultStyles = (type: VisualElement['type']) => {
    const baseStyles = {
      fontSize: '16px',
      color: '#000000',
      backgroundColor: 'transparent',
      padding: '8px 16px',
      margin: '0',
      borderRadius: '4px',
      textAlign: 'left' as const,
      fontWeight: 'normal'
    }

    switch (type) {
      case 'heading':
        return {
          ...baseStyles,
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center' as const
        }
      case 'button':
        return {
          ...baseStyles,
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '6px'
        }
      case 'image':
        return {
          ...baseStyles,
          padding: '0',
          maxWidth: '100%'
        }
      case 'container':
        return {
          ...baseStyles,
          border: '2px dashed #d1d5db',
          minHeight: '100px'
        }
      default:
        return baseStyles
    }
  }

  return (
    <DndProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Component Library */}
        <div className="w-64 p-4 border-r bg-white">
          <ComponentLibrary onAddElement={handleAddElement} />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10 space-x-2">
            <Button onClick={onPreview} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={onSave} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>

          <div 
            ref={canvasRef}
            className="absolute inset-0 m-16 bg-white shadow-lg overflow-auto"
            style={{ minHeight: '600px' }}
          >
            {elements.map((element, index) => (
              <DraggableElement
                key={element.id}
                element={element}
                index={index}
                onSelect={setSelectedElement}
                onUpdate={handleUpdateElement}
                onDelete={handleDeleteElement}
              />
            ))}
          </div>
        </div>

        {/* Property Panel */}
        <div className="w-64 p-4 border-l bg-white">
          <PropertyPanel 
            selectedElement={selectedElement} 
            onUpdateElement={handleUpdateElement} 
          />
        </div>
      </div>
    </DndProvider>
  )
}