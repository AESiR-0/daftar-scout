import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest
) {
  try {
    const body = await req.json();
    const { scoutId, pitchId } = await body;

    // Validate path parameters
    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "scoutId and pitchId are required" },
        { status: 400 }
      );
    }

    // Fetch pitch details
    const pitchDetails = await db
      .select({
        id: pitch.id,
        pitchName: pitch.pitchName,
        location: pitch.location,
        scoutId: pitch.scoutId,
        demoLink: pitch.demoLink,
        stage: pitch.stage,
        askForInvestor: pitch.askForInvestor,
        createdAt: pitch.createdAt,
        status: pitch.status,
        isCompleted: pitch.isCompleted,
        teamSize: pitch.teamSize,
        isPaid: pitch.isPaid,
      })
      .from(pitch)
      .where(and(eq(pitch.id, pitchId), eq(pitch.scoutId, scoutId)))
      .limit(1);

    if (pitchDetails.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found for this scoutId and pitchId" },
        { status: 404 }
      );
    }

    return NextResponse.json(pitchDetails[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching pitch details:", error);
    return NextResponse.json({ error: "Failed to fetch pitch details" }, { status: 500 });
  }
}