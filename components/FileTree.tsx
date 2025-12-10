"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  FilePlus,
  FolderPlus,
  Trash2,
  Edit
} from "lucide-react"

interface FileNode {
  id: string
  name: string
  path: string
  type: "file" | "directory"
  content?: string
  children?: FileNode[]
}

interface FileTreeProps {
  files: FileNode[]
  selectedFile: FileNode | null
  openFolders: Set<string>
  onFileSelect: (file: FileNode) => void
  onFolderToggle: (folderId: string) => void
  onFileCreate: (parentId: string | null, name: string) => void
  onFolderCreate: (parentId: string | null, name: string) => void
}

export default function FileTree({
  files,
  selectedFile,
  openFolders,
  onFileSelect,
  onFolderToggle,
  onFileCreate,
  onFolderCreate
}: FileTreeProps) {
  const [newFileName, setNewFileName] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [createFileParent, setCreateFileParent] = useState<string | null>(null)
  const [createFolderParent, setCreateFolderParent] = useState<string | null>(null)

  const handleFileCreate = () => {
    if (newFileName.trim()) {
      onFileCreate(createFileParent, newFileName.trim())
      setNewFileName("")
      setCreateFileParent(null)
    }
  }

  const handleFolderCreate = () => {
    if (newFolderName.trim()) {
      onFolderCreate(createFolderParent, newFolderName.trim())
      setNewFolderName("")
      setCreateFolderParent(null)
    }
  }

  const getFileIcon = (file: FileNode) => {
    if (file.type === "directory") {
      return openFolders.has(file.id) ? (
        <FolderOpen className="h-4 w-4 text-blue-500" />
      ) : (
        <Folder className="h-4 w-4 text-blue-500" />
      )
    }
    
    // Get file extension
    const ext = file.name.split('.').pop()?.toLowerCase()
    
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <File className="h-4 w-4 text-yellow-500" />
      case 'html':
        return <File className="h-4 w-4 text-orange-500" />
      case 'css':
      case 'scss':
      case 'sass':
        return <File className="h-4 w-4 text-purple-500" />
      case 'json':
        return <File className="h-4 w-4 text-green-500" />
      case 'md':
        return <File className="h-4 w-4 text-gray-500" />
      default:
        return <File className="h-4 w-4 text-gray-400" />
    }
  }

  const renderFile = (file: FileNode, level: number = 0) => {
    const isSelected = selectedFile?.id === file.id
    const isOpen = openFolders.has(file.id)

    return (
      <div key={file.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted rounded-sm ${
            isSelected ? "bg-muted" : ""
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (file.type === "directory") {
              onFolderToggle(file.id)
            } else {
              onFileSelect(file)
            }
          }}
        >
          {getFileIcon(file)}
          <span className="text-sm flex-1">{file.name}</span>
          
          {file.type === "directory" && (
            <div className="flex gap-1 opacity-0 hover:opacity-100">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCreateFolderParent(file.id)
                    }}
                  >
                    <FolderPlus className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name"
                      onKeyDown={(e) => e.key === "Enter" && handleFolderCreate()}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleFolderCreate}>Create</Button>
                      <Button variant="outline" onClick={() => setCreateFolderParent(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCreateFileParent(file.id)
                    }}
                  >
                    <FilePlus className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="File name"
                      onKeyDown={(e) => e.key === "Enter" && handleFileCreate()}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleFileCreate}>Create</Button>
                      <Button variant="outline" onClick={() => setCreateFileParent(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        
        {file.type === "directory" && isOpen && file.children && (
          <div>
            {file.children.map(child => renderFile(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-2">
      {/* Root level create buttons */}
      <div className="flex gap-1 mb-2">
        <Dialog open={createFileParent === null} onOpenChange={(open) => !open && setCreateFileParent(null)}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setCreateFileParent(null)}
            >
              <FilePlus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="File name"
                onKeyDown={(e) => e.key === "Enter" && handleFileCreate()}
              />
              <div className="flex gap-2">
                <Button onClick={handleFileCreate}>Create</Button>
                <Button variant="outline" onClick={() => setCreateFileParent(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={createFolderParent === null} onOpenChange={(open) => !open && setCreateFolderParent(null)}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setCreateFolderParent(null)}
            >
              <FolderPlus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                onKeyDown={(e) => e.key === "Enter" && handleFolderCreate()}
              />
              <div className="flex gap-2">
                <Button onClick={handleFolderCreate}>Create</Button>
                <Button variant="outline" onClick={() => setCreateFolderParent(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* File tree */}
      {files.map(file => renderFile(file))}
    </div>
  )
}