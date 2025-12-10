import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string, fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify file belongs to user's project
    const file = await db.file.findFirst({
      where: { 
        id: params.fileId,
        project: {
          id: params.projectId,
          workspace: { ownerId: session.user.id }
        }
      }
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const { content } = await request.json()

    const updatedFile = await db.file.update({
      where: { id: params.fileId },
      data: { content: content || "" }
    })

    return NextResponse.json(updatedFile)
  } catch (error) {
    console.error("Error updating file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string, fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify file belongs to user's project
    const file = await db.file.findFirst({
      where: { 
        id: params.fileId,
        project: {
          id: params.projectId,
          workspace: { ownerId: session.user.id }
        }
      }
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    await db.file.delete({
      where: { id: params.fileId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}