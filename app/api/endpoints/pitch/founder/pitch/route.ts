import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest
) {
  try {
    const body = await req.json();
    const { pitchId } = await body;

    // Validate path parameter
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
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (pitchDetails.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found for this pitchId" },
        { status: 404 }
      );
    }

    return NextResponse.json(pitchDetails[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching pitch details:", error);
    return NextResponse.json({ error: "Failed to fetch pitch details" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();
    const {
      pitchId,
      pitchName,
      location,
      scoutId,
      demoLink,
      stage,
      askForInvestor,
      status,
      isCompleted,
      teamSize,
      isPaid,
    } = body;

    // Validate required parameters
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }
    if (!pitchName || typeof pitchName !== "string") {
      return NextResponse.json(
        { error: "pitchName is required and must be a string" },
        { status: 400 }
      );
    }

    // Optional field validations
    if (location && typeof location !== "string") {
      return NextResponse.json(
        { error: "location must be a string" },
        { status: 400 }
      );
    }
    if (scoutId && typeof scoutId !== "string") {
      return NextResponse.json(
        { error: "scoutId must be a string" },
        { status: 400 }
      );
    }
    if (demoLink && typeof demoLink !== "string") {
      return NextResponse.json(
        { error: "demoLink must be a string" },
        { status: 400 }
      );
    }
    if (stage && typeof stage !== "string") {
      return NextResponse.json(
        { error: "stage must be a string" },
        { status: 400 }
      );
    }
    if (askForInvestor !== undefined && typeof askForInvestor !== "boolean") {
      return NextResponse.json(
        { error: "askForInvestor must be a boolean" },
        { status: 400 }
      );
    }
    if (status && typeof status !== "string") {
      return NextResponse.json(
        { error: "status must be a string" },
        { status: 400 }
      );
    }
    if (isCompleted !== undefined && typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { error: "isCompleted must be a boolean" },
        { status: 400 }
      );
    }
    if (teamSize !== undefined && (!Number.isInteger(teamSize) || teamSize < 0)) {
      return NextResponse.json(
        { error: "teamSize must be a non-negative integer" },
        { status: 400 }
      );
    }
    if (isPaid !== undefined && typeof isPaid !== "boolean") {
      return NextResponse.json(
        { error: "isPaid must be a boolean" },
        { status: 400 }
      );
    }

    // Check if pitch exists
    const existingPitch = await db
      .select()
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (existingPitch.length > 0) {
      // Update existing pitch
      await db
        .update(pitch)
        .set({
          pitchName,
          location: location || existingPitch[0].location,
          scoutId: scoutId || existingPitch[0].scoutId,
          demoLink: demoLink || existingPitch[0].demoLink,
          stage: stage || existingPitch[0].stage,
          askForInvestor: askForInvestor ?? existingPitch[0].askForInvestor,
          status: status || existingPitch[0].status,
          isCompleted: isCompleted ?? existingPitch[0].isCompleted,
          teamSize: teamSize ?? existingPitch[0].teamSize,
          isPaid: isPaid ?? existingPitch[0].isPaid,
        })
        .where(eq(pitch.id, pitchId));
    } else {
      // Insert new pitch
      await db.insert(pitch).values({
        id: pitchId,
        pitchName,
        location,
        scoutId,
        demoLink,
        stage,
        askForInvestor: askForInvestor ?? false,
        createdAt: new Date(),
        status,
        isCompleted: isCompleted ?? false,
        teamSize: teamSize ?? null,
        isPaid: isPaid ?? false,
      });
    }

    return NextResponse.json(
      {
        status: "success",
        message: existingPitch.length > 0 ? "Pitch updated successfully" : "Pitch created successfully",
      },
      { status: existingPitch.length > 0 ? 200 : 201 }
    );
  } catch (error) {
    console.error("Error saving pitch information:", error);
    return NextResponse.json({ error: "Failed to save pitch information" }, { status: 500 });
  }
}