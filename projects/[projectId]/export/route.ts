import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import JSZip from "jszip"

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
      where: { projectId: params.projectId }
    })

    // Create ZIP file
    const zip = new JSZip()

    // Add files to ZIP
    files.forEach(file => {
      if (file.type === "file") {
        zip.file(file.path, file.content || "")
      }
    })

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${project.name}.zip"`,
      },
    })
  } catch (error) {
    console.error("Error exporting project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}