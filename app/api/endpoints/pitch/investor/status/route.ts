import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    const pitchId = searchParams.get("pitchId");

    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "Missing scoutId or pitchId" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { investorStatus } = body;

    if (!investorStatus) {
      return NextResponse.json(
        { error: "Missing investorStatus" },
        { status: 400 }
      );
    }

    // Update the pitch status
    await db
      .update(pitch)
      .set({
        investorStatus
      })
      .where(
        and(
          eq(pitch.scoutId, scoutId),
          eq(pitch.id, pitchId)
        )
      );

    return NextResponse.json({
      success: true,
      message: "Pitch status updated successfully"
    });
  } catch (error) {
    console.error("Error updating pitch status:", error);
    return NextResponse.json(
      { error: "Failed to update pitch status" },
      { status: 500 }
    );
  }
} 