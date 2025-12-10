import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify project belongs to user
    const project = await db.project.findFirst({
      where: { 
        id: params.projectId,
        workspace: { ownerId: session.user.id }
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const files = await db.file.findMany({
      where: { projectId: params.projectId },
      orderBy: { name: "asc" }
    })

    // Build file tree structure
    const fileMap = new Map()
    const rootFiles: any[] = []

    files.forEach(file => {
      fileMap.set(file.id, { ...file, children: [] })
    })

    files.forEach(file => {
      if (file.parentId) {
        const parent = fileMap.get(file.parentId)
        if (parent) {
          parent.children.push(fileMap.get(file.id))
        }
      } else {
        rootFiles.push(fileMap.get(file.id))
      }
    })

    return NextResponse.json(rootFiles)
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify project belongs to user
    const project = await db.project.findFirst({
      where: { 
        id: params.projectId,
        workspace: { ownerId: session.user.id }
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const { name, type, parentId } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Generate path
    let path = name
    if (parentId) {
      const parent = await db.file.findUnique({
        where: { id: parentId }
      })
      if (parent) {
        path = `${parent.path}/${name}`
      }
    }

    const file = await db.file.create({
      data: {
        name: name.trim(),
        path,
        type: type || "file",
        projectId: params.projectId,
        parentId: parentId || null
      }
    })

    return NextResponse.json(file)
  } catch (error) {
    console.error("Error creating file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}