import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch";
import { pitchTeam } from "@/backend/drizzle/models/pitch"; // Assuming pitchTeam model is defined
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const pitchId = req.headers.get("pitch_id");

    // Validate pitchId
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }

    // Fetch pitch details
    const pitchDetails = await db
      .select({
        id: pitch.id,
      })
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (pitchDetails.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found for this pitchId" },
        { status: 404 }
      );
    }

    // Fetch pitch team details
    const pitchTeamDetails = await db
      .select({
        id: pitchTeam.id,
        userId: pitchTeam.userId,
        designation: pitchTeam.designation,
        hasApproved: pitchTeam.hasApproved,
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    // Combine pitch and team details
    return NextResponse.json(
      {
        pitch: pitchDetails[0],
        team: pitchTeamDetails,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pitch details:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pitchId, userId } = body;

    // Validate required fields
    if (!pitchId || !userId) {
      return NextResponse.json(
        { error: "pitchId and userId are required" },
        { status: 400 }
      );
    }

    // Check if the team member exists for the given pitchId and userId
    const existingTeamMember = await db
      .select()
      .from(pitchTeam)
      .where(and(eq(pitchTeam.pitchId, pitchId), eq(pitchTeam.userId, userId)))
      .limit(1);

    if (existingTeamMember.length === 0) {
      return NextResponse.json(
        { error: "Team member not found for this pitch" },
        { status: 404 }
      );
    }

    // Update the team member's approval status to true
    await db
      .update(pitchTeam)
      .set({ hasApproved: true })
      .where(eq(pitchTeam.id, existingTeamMember[0].id));

    return NextResponse.json(
      { status: "success", message: "Team member approved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating team member approval:", error);
    return NextResponse.json(
      { error: "Failed to update team member approval" },
      { status: 500 }
    );
  }
}
