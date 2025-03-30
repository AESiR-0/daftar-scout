import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch"; // Ensure this is imported
import { eq } from "drizzle-orm";

// GET: Fetch team members for a pitch by pitchId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");

    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }

    // Check if the pitch exists
    const pitchExists = await db
      .select()
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (pitchExists.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found" },
        { status: 404 }
      );
    }

    // Fetch team members (userIds) for the given pitchId
    const teamData = await db
      .select({
        id: pitchTeam.id,
        userId: pitchTeam.userId,
        pitchId: pitchTeam.pitchId,
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    return NextResponse.json(
      {
        message: "Team members fetched successfully",
        data: teamData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pitch team:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch team" },
      { status: 500 }
    );
  }
}

// POST: Add a team member to a pitch
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

    // Check if the pitch exists
    const pitchExists = await db
      .select()
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (pitchExists.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found" },
        { status: 404 }
      );
    }

    // Insert the new team member
    const newTeamMember = await db
      .insert(pitchTeam)
      .values({
        userId,
        pitchId,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Team member added successfully",
        data: newTeamMember[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding team member:", error);

    // Handle foreign key violation (e.g., invalid userId or pitchId)
    if (error.code === "23503") {
      return NextResponse.json(
        {
          error:
            error.detail.includes("user_id")
              ? "Invalid userId: user does not exist"
              : "Invalid pitchId: pitch does not exist",
        },
        { status: 400 }
      );
    }

    // Handle duplicate entry (if userId+pitchId is unique)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This user is already a team member for this pitch" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}