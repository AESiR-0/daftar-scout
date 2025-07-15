import { NextResponse, NextRequest } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateAudienceSchema = z.object({
  scoutId: z.string(),
  targetAudLocation: z.string().nullable(),
  targetAudAgeStart: z.number().nullable(),
  targetAudAgeEnd: z.number().nullable(),
  scoutCommunity: z.string().nullable(),
  targetedGender: z.string().nullable(),
  scoutStage: z.string().nullable(),
  scoutSector: z.array(z.string()).nullable(),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UpdateAudienceSchema.parse(body);
    const {
      scoutId,
      targetAudLocation,
      targetAudAgeStart,
      targetAudAgeEnd,
      scoutCommunity,
      targetedGender,
      scoutStage,
      scoutSector,
    } = parsed;

    // Backend validation for age range
    if (targetAudAgeStart !== null && targetAudAgeEnd !== null) {
      if (targetAudAgeStart < 18 || targetAudAgeStart > 150) {
        return NextResponse.json({ error: "Minimum age must be between 18 and 150" }, { status: 400 });
      }
      if (targetAudAgeEnd < 18 || targetAudAgeEnd > 150) {
        return NextResponse.json({ error: "Maximum age must be between 18 and 150" }, { status: 400 });
      }
      if (targetAudAgeStart > targetAudAgeEnd) {
        return NextResponse.json({ error: "Minimum age cannot be greater than maximum age" }, { status: 400 });
      }
    }
    // Deduplicate sectors
    const dedupedSectors = scoutSector ? Array.from(new Set(scoutSector)) : [];

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
        targetAudAgeEnd: targetAudAgeEnd ?? existingScout[0].targetAudAgeEnd,
        scoutCommunity: scoutCommunity ?? existingScout[0].scoutCommunity,
        targetedGender: targetedGender ?? existingScout[0].targetedGender,
        scoutStage: scoutStage ?? existingScout[0].scoutStage,
        scoutSector: dedupedSectors.length > 0 ? dedupedSectors : existingScout[0].scoutSector ?? [],
      })
      .where(eq(scouts.scoutId, scoutId))
      .returning();

    return NextResponse.json(
      { message: "Scout details updated successfully", data: updatedScout[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating scout:", error);
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
      .select({
        targetAudLocation: scouts.targetAudLocation,
        targetAudAgeStart: scouts.targetAudAgeStart,
        targetAudAgeEnd: scouts.targetAudAgeEnd,
        scoutCommunity: scouts.scoutCommunity,
        targetedGender: scouts.targetedGender,
        scoutStage: scouts.scoutStage,
        scoutSector: scouts.scoutSector,
      })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (scout.length === 0) {
      return NextResponse.json(
        {
          data: {
            targetAudLocation: "",
            targetAudAgeStart: 18,
            targetAudAgeEnd: 65,
            scoutCommunity: "",
            targetedGender: "",
            scoutStage: "",
            scoutSector: [],
          },
        },
        { status: 200 }
      );
    }

    // Ensure scoutSector is an array
    const data = {
      ...scout[0],
      scoutSector: Array.isArray(scout[0].scoutSector)
        ? scout[0].scoutSector
        : [],
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching scout:", error);
    return NextResponse.json(
      { error: "Failed to fetch scout details" },
      { status: 500 }
    );
  }
}
