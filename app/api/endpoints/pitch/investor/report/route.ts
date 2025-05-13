import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/database"
import { report } from "@/backend/drizzle/models/reportAndRequests"
import { investorPitch } from "@/backend/drizzle/models/pitch"
import { users } from "@/backend/drizzle/models/users"
import { and, eq } from "drizzle-orm"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pitchId, scoutId, reportDescription } = await req.json()

    if (!pitchId || !scoutId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get user ID from email
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if pitch has already been reported by this user
    const [existingReport] = await db
      .select()
      .from(report)
      .where(
        and(
          eq(report.pitchId, pitchId),
          eq(report.reportedBy, user.id)
        )
      )

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this pitch" },
        { status: 400 }
      )
    }

    // Create report
    await db.insert(report).values({
      reportedBy: user.id,
      pitchId,
      scoutId,
      reportDescription,
    })

    // Update investor pitch status
    await db
      .update(investorPitch)
      .set({
        isReported: true,
        status: "rejected",
      })
      .where(
        and(
          eq(investorPitch.pitchId, pitchId),
          eq(investorPitch.investorId, user.id)
        )
      )

    return NextResponse.json({ message: "Pitch reported successfully" })
  } catch (error) {
    console.error("Error reporting pitch:", error)
    return NextResponse.json(
      { error: "Failed to report pitch" },
      { status: 500 }
    )
  }
} 