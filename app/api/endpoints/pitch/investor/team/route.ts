import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitchTeam } from "@/backend/drizzle/models/pitch";
import { pitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { scoutId: string; pitchId: string } }
) {
  try {
    const { scoutId, pitchId } = params;

    // Validate path parameters
    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "scoutId and pitchId are required" },
        { status: 400 }
      );
    }

    // Verify the pitch exists and matches the scoutId
    const pitchCheck = await db
      .select()
      .from(pitch)
      .where(and(eq(pitch.id, pitchId), eq(pitch.scoutId, scoutId)))
      .limit(1);

    if (pitchCheck.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found for this scoutId and pitchId" },
        { status: 404 }
      );
    }

    // Fetch pitch team
    const team = await db
      .select({
        id: pitchTeam.id,
        userId: pitchTeam.userId,
        designation: pitchTeam.designation,
        pitchId: pitchTeam.pitchId,
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error("Error fetching pitch team:", error);
    return NextResponse.json({ error: "Failed to fetch pitch team" }, { status: 500 });
  }
}