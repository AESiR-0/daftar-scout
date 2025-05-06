import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch";
import { users } from "@/backend/drizzle/models/users";
import { pitchTeam } from "@/backend/drizzle/models/pitch"; // Assuming pitchTeam model is defined
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");
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
        userName: users.name,
        userLastName: users.lastName,
        designation: pitchTeam.designation,
        hasApproved: pitchTeam.hasApproved,
      })
      .from(pitchTeam)
      .innerJoin(users, eq(pitchTeam.userId, users.id))
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
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get request body
    const { pitchId, askForInvestor, status } = await req.json();

    if (!pitchId) {
      return NextResponse.json({ error: "Pitch ID is required" }, { status: 400 });
    }

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

    // Update pitch details
    const updatedPitch = await db
      .update(pitch)
      .set({
        askForInvestor: askForInvestor || null,
        status: status || "draft"
      })
      .where(eq(pitch.id, pitchId))
      .returning();

    if (!updatedPitch.length) {
      return NextResponse.json({ error: "Failed to update pitch" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Pitch updated successfully",
      pitch: updatedPitch[0]
    });

  } catch (error) {
    console.error("Error updating pitch:", error);
    return NextResponse.json(
      { error: "Failed to update pitch" },
      { status: 500 }
    );
  }
}
