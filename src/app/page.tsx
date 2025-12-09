"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Folder, File, Code, Terminal, Globe, Rocket, Users, Key } from "lucide-react"
import { toast } from "sonner"
import ApiKeySettings from "@/components/ApiKeySettings"

interface Workspace {
  id: string
  name: string
  slug: string
  _count: {
    projects: number
  }
}

interface Project {
  id: string
  name: string
  slug: string
  workspaceId: string
  _count: {
    files: number
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [newProjectName, setNewProjectName] = useState("")

  useEffect(() => {
    if (session?.user) {
      fetchWorkspaces()
    } else {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (selectedWorkspace) {
      fetchProjects(selectedWorkspace)
    }
  }, [selectedWorkspace])

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces")
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data)
        if (data.length > 0) {
          setSelectedWorkspace(data[0].id)
        }
      }
    } catch (error) {
      toast.error("Failed to fetch workspaces")
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async (workspaceId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/projects`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      toast.error("Failed to fetch projects")
    }
  }

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWorkspaceName })
      })

      if (response.ok) {
        const workspace = await response.json()
        setWorkspaces([...workspaces, workspace])
        setNewWorkspaceName("")
        toast.success("Workspace created successfully")
      }
    } catch (error) {
      toast.error("Failed to create workspace")
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim() || !selectedWorkspace) return

    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspace}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName })
      })

      if (response.ok) {
        const project = await response.json()
        setProjects([...projects, project])
        setNewProjectName("")
        toast.success("Project created successfully")
      }
    } catch (error) {
      toast.error("Failed to create project")
    }
  }

  const openProject = (project: Project) => {
    window.location.href = `/studio/${project.id}`
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Code className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">AiAppsy Web Studio</CardTitle>
            <CardDescription>
              Your complete web development environment in the browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        signIn("credentials", {
                          email: (e.target as HTMLInputElement).value,
                          password: "demo",
                          redirect: false
                        })
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter any password (demo)"
                    onKeyDown={(e) => {
                      const email = (document.getElementById("email") as HTMLInputElement)?.value
                      if (e.key === "Enter" && email) {
                        signIn("credentials", {
                          email,
                          password: "demo",
                          redirect: false
                        })
                      }
                    }}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    const email = (document.getElementById("email") as HTMLInputElement)?.value
                    if (email) {
                      signIn("credentials", {
                        email,
                        password: "demo",
                        redirect: false
                      })
                    }
                  }}
                >
                  Sign In
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Just enter your email and any password to create an account
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    const email = (document.getElementById("email") as HTMLInputElement)?.value
                    if (email) {
                      signIn("credentials", {
                        email,
                        password: "demo",
                        redirect: false
                      })
                    }
                  }}
                >
                  Create Account
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-semibold">AiAppsy Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{session.user?.email}</Badge>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {session.user?.name}</h1>
          <p className="text-muted-foreground">
            Manage your workspaces and projects in one place
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Workspaces Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Workspaces
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Workspace</DialogTitle>
                        <DialogDescription>
                          Workspaces help you organize your projects
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="workspace-name">Workspace Name</Label>
                          <Input
                            id="workspace-name"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="My Workspace"
                          />
                        </div>
                        <Button onClick={createWorkspace} className="w-full">
                          Create Workspace
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedWorkspace === workspace.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedWorkspace(workspace.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{workspace.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {workspace._count.projects} projects
                        </p>
                      </div>
                      <Badge variant="secondary">{workspace.slug}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Projects Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <File className="h-5 w-5" />
                    Projects
                  </CardTitle>
                  {selectedWorkspace && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          New Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Project</DialogTitle>
                          <DialogDescription>
                            Start building your next web application
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Input
                              id="project-name"
                              value={newProjectName}
                              onChange={(e) => setNewProjectName(e.target.value)}
                              placeholder="My Awesome Project"
                            />
                          </div>
                          <Button onClick={createProject} className="w-full">
                            Create Project
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first project to get started
                    </p>
                    {selectedWorkspace && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Project
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogDescription>
                              Start building your next web application
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="project-name-2">Project Name</Label>
                              <Input
                                id="project-name-2"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="My Awesome Project"
                              />
                            </div>
                            <Button onClick={createProject} className="w-full">
                              Create Project
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <Card
                        key={project.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openProject(project)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            <Badge variant="outline">{project.slug}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{project._count.files} files</span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost">
                                <Code className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Terminal className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Globe className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Code className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Code Editor</h3>
                  <p className="text-sm text-muted-foreground">
                    Monaco-powered editor with syntax highlighting
                  </p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Terminal className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Terminal</h3>
                  <p className="text-sm text-muted-foreground">
                    Full terminal access with npm, git, and more
                  </p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Rocket className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Deploy</h3>
                  <p className="text-sm text-muted-foreground">
                    One-click deployment to production
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* API Key Settings Panel */}
          <div className="lg:col-span-1">
            <ApiKeySettings />
          </div>
        </div>
      </main>
    </div>
  )
}