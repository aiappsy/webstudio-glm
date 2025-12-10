import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

    // Create deployment record
    const deployment = await db.deployment.create({
      data: {
        projectId: params.projectId,
        status: "building",
        logs: "Deployment started...\n"
      }
    })

    // Simulate deployment process (in real app, this would be async)
    setTimeout(async () => {
      try {
        // Update deployment with success
        await db.deployment.update({
          where: { id: deployment.id },
          data: {
            status: "success",
            url: `https://${project.slug}.aiappsy.com`,
            logs: "Deployment started...\nBuilding project...\nDeploying to production...\nDeployment successful!\n"
          }
        })
      } catch (error) {
        console.error("Error updating deployment:", error)
      }
    }, 3000)

    return NextResponse.json(deployment)
  } catch (error) {
    console.error("Error creating deployment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const deployments = await db.deployment.findMany({
      where: { projectId: params.projectId },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(deployments)
  } catch (error) {
    console.error("Error fetching deployments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}