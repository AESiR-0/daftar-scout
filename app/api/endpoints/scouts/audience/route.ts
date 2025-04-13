import { NextResponse, NextRequest } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scoutId,
      targetAudLocation,
      targetAudAgeStart,
      targetAudAgeEnd,
      scoutCommunity,
      targetedGender,
      scoutStage,
      scoutSector,
    } = body;

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
    }

    const existingScout = await db
      .select()
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (existingScout.length === 0) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    const updatedScout = await db
      .update(scouts)
      .set({
        targetAudLocation:
          targetAudLocation ?? existingScout[0].targetAudLocation,
        targetAudAgeStart:
          targetAudAgeStart ?? existingScout[0].targetAudAgeStart,
        targetedGender: targetedGender ?? existingScout[0].targetedGender,
        targetAudAgeEnd: targetAudAgeEnd ?? existingScout[0].targetAudAgeEnd,
        scoutCommunity: scoutCommunity ?? existingScout[0].scoutCommunity,
        scoutStage: scoutStage ?? existingScout[0].scoutStage,
        scoutSector: scoutSector ?? existingScout[0].scoutSector,
      })
      .where(eq(scouts.scoutId, scoutId))
      .returning();

    return NextResponse.json(
      { message: "Scout details updated successfully", data: updatedScout[0] },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update scout details" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId query parameter is required" },
        { status: 400 }
      );
    }

    const scout = await db
      .select()
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (scout.length === 0) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    return NextResponse.json({ data: scout[0] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch scout details" },
      { status: 500 }
    );
  }
}
