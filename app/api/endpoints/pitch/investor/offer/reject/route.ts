import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, pitchId, investorId, reason } = body;

    // Validate parameters
    if (!scoutId || !pitchId || !investorId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
        { status: 400 }
      );
    }
    if (reason && typeof reason !== "string") {
      return NextResponse.json(
        { error: "reason must be a string if provided" },
        { status: 400 }
      );
    }

    // Verify pitch exists and matches scoutId
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

    // Update pitch status to rejected
    await db
      .update(pitch)
      .set({
        status: "rejected",
      })
      .where(eq(pitch.id, pitchId));

    return NextResponse.json(
      {
        status: "success",
        message: "Pitch rejected successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting pitch:", error);
    return NextResponse.json(
      { error: "Failed to reject pitch" },
      { status: 500 }
    );
  }
}
