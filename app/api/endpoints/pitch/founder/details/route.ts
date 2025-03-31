import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, focusSectors, pitchFocusSectors } from "@/backend/drizzle/models/pitch";
import { eq, inArray } from "drizzle-orm";

// GET: Fetch pitch details by pitchId, including focus sectors
export async function GET(req: NextRequest) {
  try {
    const body = await req.json();
    const { pitchId } = await body;

    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }

    // Fetch pitch details
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
      return NextResponse.json(
        { error: "Pitch not found" },
        { status: 404 }
      );
    }

    // Fetch related focus sectors
    const focusSectorData = await db
      .select({
        sectorName: focusSectors.sectorName,
      })
      .from(pitchFocusSectors)
      .innerJoin(focusSectors, eq(pitchFocusSectors.focusSectorId, focusSectors.id))
      .where(eq(pitchFocusSectors.pitchId, pitchId));

    const focusSectorsList = focusSectorData.map((fs) => fs.sectorName);

    // Combine pitch data with focus sectors
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

// POST: Create a new pitch with details and focus sectors
export async function POST(req: NextRequest) {
  try {
    const postBody = await req.json();
    const { pitchId, pitchName, location, demoLink, stage, focusSectors: sectorNames } = postBody;

    // Validate required fields
    if (!pitchId || !pitchName) {
      return NextResponse.json(
        { error: "pitchId and pitchName are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(sectorNames)) {
      return NextResponse.json(
        { error: "focusSectors must be an array of sector names" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Insert or update the pitch
      const newPitch = await tx
        .insert(pitch)
        .values({
          id: pitchId,
          pitchName,
          location: location || null,
          demoLink: demoLink || null,
          stage: stage || null,
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: pitch.id,
          set: {
            pitchName,
            location: location || null,
            demoLink: demoLink || null,
            stage: stage || null,
          },
        })
        .returning();

      // Handle focus sectors
      if (sectorNames.length > 0) {
        // Fetch or create focus sectors
        const existingSectors = await tx
          .select({ id: focusSectors.id, sectorName: focusSectors.sectorName })
          .from(focusSectors)
          .where(inArray(focusSectors.sectorName, sectorNames));

        const existingSectorNames = existingSectors.map((s) => s.sectorName);
        const newSectorNames = sectorNames.filter((name) => !existingSectorNames.includes(name));

        // Insert new focus sectors if they don’t exist
        let newSectors: any[] = [];
        if (newSectorNames.length > 0) {
          newSectors = await tx
            .insert(focusSectors)
            .values(newSectorNames.map((name) => ({ sectorName: name })))
            .returning({ id: focusSectors.id, sectorName: focusSectors.sectorName });
        }

        // Combine existing and new sector IDs
        const allSectorIds = [
          ...existingSectors.map((s) => s.id),
          ...newSectors.map((s) => s.id),
        ];

        // Clear existing pitch-focus sector relations
        await tx
          .delete(pitchFocusSectors)
          .where(eq(pitchFocusSectors.pitchId, pitchId));

        // Insert new pitch-focus sector relations
        await tx.insert(pitchFocusSectors).values(
          allSectorIds.map((focusSectorId) => ({
            pitchId,
            focusSectorId,
          }))
        );
      }

      return newPitch[0];
    });

    return NextResponse.json(
      { message: "Pitch created/updated successfully", data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating pitch:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A pitch with this ID already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create pitch" },
      { status: 500 }
    );
  }
}