import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { users } from "@/backend/drizzle/models/users";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pitchId } = await req.json();

    if (!pitchId) {
      return NextResponse.json({ error: "Pitch ID is required" }, { status: 400 });
    }

    // Get user ID from database using session email
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Verify user is part of the pitch team
    const teamMember = await db
      .select()
      .from(pitchTeam)
      .where(
        and(
          eq(pitchTeam.pitchId, pitchId),
          eq(pitchTeam.userId, userId)
        )
      )
      .limit(1);

    if (!teamMember.length) {
      return NextResponse.json({ error: "Not authorized to modify this pitch" }, { status: 403 });
    }

    // Update team member's approval
    await db.update(pitchTeam).set({
      hasApproved: true
    }).where(
      and(
        eq(pitchTeam.pitchId, pitchId),
        eq(pitchTeam.userId, userId)
      )
    );

    // Get all team members and their approval status
    const allTeamMembers = await db
      .select({
        hasApproved: pitchTeam.hasApproved
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    const totalTeamMembers = allTeamMembers.length;
    const approvedMembers = allTeamMembers.filter(member => member.hasApproved).length;
    const allApproved = totalTeamMembers === approvedMembers;

    // If all team members have approved, update pitch status
    if (allApproved) {
      await db
        .update(pitch)
        .set({
          status: "approved"
        })
        .where(eq(pitch.id, pitchId));
    }

    return NextResponse.json({
      success: true,
      message: "Pitch approval updated successfully",
      allApproved
    });
  } catch (error) {
    console.error("Error updating pitch approval:", error);
    return NextResponse.json(
      { error: "Failed to update pitch approval" },
      { status: 500 }
    );
  }
} 