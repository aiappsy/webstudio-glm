import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaces = await db.workspace.findMany({
      where: { ownerId: session.user.id },
      include: {
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json(workspaces)
  } catch (error) {
    console.error("Error fetching workspaces:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")

    const workspace = await db.workspace.create({
      data: {
        name: name.trim(),
        slug,
        ownerId: session.user.id
      }
    })

    return NextResponse.json(workspace)
  } catch (error) {
    console.error("Error creating workspace:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}