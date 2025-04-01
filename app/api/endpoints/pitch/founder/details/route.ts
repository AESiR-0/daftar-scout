import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, focusSectors, pitchFocusSectors } from "@/backend/drizzle/models/pitch";
import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET: Fetch pitch details by pitchId from request body
export async function GET(req: NextRequest) {
  try {
    const pitchId = req.headers.get("pitch_id");

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
      return NextResponse.json(
        { error: "Pitch not found" },
        { status: 404 }
      );
    }

    const focusSectorData = await db
      .select({
        sectorName: focusSectors.sectorName,
      })
      .from(pitchFocusSectors)
      .innerJoin(focusSectors, eq(pitchFocusSectors.focusSectorId, focusSectors.id))
      .where(eq(pitchFocusSectors.pitchId, pitchId));

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

// POST: Create a new pitch with details and generate pitchId
export async function POST(req: NextRequest) {
  try {
    const postBody = await req.json();
    const { pitchName, location, demoLink, stage, focusSectors: sectorNames } = postBody;

    // Validate required fields
    if (!pitchName) {
      return NextResponse.json(
        { error: "pitchName is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(sectorNames)) {
      return NextResponse.json(
        { error: "focusSectors must be an array of sector names" },
        { status: 400 }
      );
    }

    // Generate pitchId: first 3 chars of pitchName + 3 random numbers + UUID suffix
    const pitchPrefix = pitchName.slice(0, 3).toLowerCase();
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit random number (100-999)
    const uuidSuffix = randomUUID().split("-")[0]; // First part of UUID for uniqueness
    const pitchId = `${pitchPrefix}${randomNum}-${uuidSuffix}`; // e.g., "tes472-8f3b2c1d"

    // Start a transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Insert the pitch with generated pitchId
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
        .returning();

      // Handle focus sectors
      if (sectorNames.length > 0) {
        const existingSectors = await tx
          .select({ id: focusSectors.id, sectorName: focusSectors.sectorName })
          .from(focusSectors)
          .where(inArray(focusSectors.sectorName, sectorNames));

        const existingSectorNames = existingSectors.map((s) => s.sectorName);
        const newSectorNames = sectorNames.filter((name) => !existingSectorNames.includes(name));

        let newSectors: any[] = [];
        if (newSectorNames.length > 0) {
          newSectors = await tx
            .insert(focusSectors)
            .values(newSectorNames.map((name) => ({ sectorName: name })))
            .returning({ id: focusSectors.id, sectorName: focusSectors.sectorName });
        }

        const allSectorIds = [
          ...existingSectors.map((s) => s.id),
          ...newSectors.map((s) => s.id),
        ];

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
      { message: "Pitch created successfully", data: result, pitchId },
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