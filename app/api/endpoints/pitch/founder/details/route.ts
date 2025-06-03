import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
  pitch,
  focusSectors,
  pitchFocusSectors,
} from "@/backend/drizzle/models/pitch";
import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET: Fetch pitch details by pitchId from request body
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

    const pitchData = await db
      .select({
        id: pitch.id,
        pitchName: pitch.pitchName,
        location: pitch.location,
        demoLink: pitch.demoLink,
        stage: pitch.stage,
      })
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);
    if (pitchData.length === 0) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    const focusSectorData = await db
      .select({
        sectorName: focusSectors.sectorName,
      })
      .from(pitchFocusSectors)
      .innerJoin(
        focusSectors,
        eq(pitchFocusSectors.focusSectorId, focusSectors.id)
      )
      .where(eq(pitchFocusSectors.pitchId, pitchId));
    console.log(focusSectorData);
    const focusSectorsList = focusSectorData.map((fs) => fs.sectorName);

    const result = {
      ...pitchData[0],
      focusSectors: focusSectorsList,
    };

    return NextResponse.json(result, { status: 200 });
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
    const postBody = await req.json();

    const {
      pitchName,
      location,
      demoLink,
      stage,
      scoutId,
      pitchId,
      askForInvestor,
      teamSize,
    } = postBody;
    const sectors = postBody.focusSectors ;

    // Validate required fields
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }
    if (!pitchName) {
      return NextResponse.json(
        { error: "pitchName is required" },
        { status: 400 }
      );
    }
    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(sectors)) {
      return NextResponse.json(
        { error: "focusSectors must be an array of sector names" },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      // Update the pitch
      const updatedPitch = await tx
        .update(pitch)
        .set({
          pitchName,
          location: location,
          scoutId,
          demoLink: demoLink,
          stage: stage,
          askForInvestor: askForInvestor,
          teamSize: teamSize,
        })
        .where(eq(pitch.id, pitchId))
        .returning();

      if (updatedPitch.length === 0) {
        throw new Error("Pitch not found");
      }

      // Get existing sectors
      const existingSectors = await tx
        .select({ id: focusSectors.id, sectorName: focusSectors.sectorName })
        .from(focusSectors)
        .where(inArray(focusSectors.sectorName, sectors));

      const existingNames = existingSectors.map((s) => s.sectorName);
      const sectorsToInsert = sectors.filter((s) => !existingNames.includes(s));

      let insertedSectors: typeof existingSectors = [];
      if (sectorsToInsert.length > 0) {
        insertedSectors = await tx
          .insert(focusSectors)
          .values(sectorsToInsert.map((name) => ({ sectorName: name })))
          .returning();
      }

      const allSectorIds = [...existingSectors, ...insertedSectors].map(
        (s) => s.id
      );

      // Clean up previous pitch-sector links
      await tx
        .delete(pitchFocusSectors)
        .where(eq(pitchFocusSectors.pitchId, pitchId));

      // Insert updated links
      let linkedFocusSectors: (typeof pitchFocusSectors.$inferSelect)[] = [];
      if (allSectorIds.length > 0) {
        linkedFocusSectors = await tx
          .insert(pitchFocusSectors)
          .values(
            allSectorIds.map((focusSectorId) => ({
              pitchId,
              focusSectorId,
            }))
          )
          .returning();
        console.log("Updated pitchFocusSectors");
      }

      return {
        pitch: updatedPitch[0],
        focusSectors: linkedFocusSectors,
      };
    });

    return NextResponse.json(
      { message: "Pitch updated successfully", data: result, pitchId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating pitch:", error);

    if (error.message === "Pitch not found") {
      return NextResponse.json(
        { error: "No pitch found with the provided ID" },
        { status: 404 }
      );
    }

    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Invalid scoutId or focusSectorId (foreign key violation)" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update pitch",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
