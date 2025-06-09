import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { investorPitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId") || null;
    const pitchId = searchParams.get("pitchId") || null;
    const investorId = searchParams.get("investorId") || null;

    // Validate parameters
    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
        { status: 400 }
      );
    }

    // Fetch the note
    const result = await db
      .select({
        id: investorPitch.investorId,
        note: investorPitch.note,
      })
      .from(investorPitch)
      .where(
        and(
          eq(investorPitch.scoutId, scoutId),
          eq(investorPitch.pitchId, pitchId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "No note found for this scoutId, pitchId, and investorId" },
        { status: 404 }
      );
    }

    return NextResponse.json({ note: result[0].note || "", id: result[0].id }, { status: 200 });
  } catch (error) {
    console.error("Error fetching investor note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, pitchId, userId, note } = body;
    console.log("Received data:", body);
    // Validate parameters
    if (!scoutId || !pitchId || !userId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
        { status: 400 }
      );
    }
    if (typeof note !== "string") {
      return NextResponse.json(
        { error: "note must be a string" },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(investorPitch)
      .where(
        and(
          eq(investorPitch.scoutId, scoutId),
          eq(investorPitch.pitchId, pitchId),
        )
      )
      .limit(1);

    if (existingRecord.length > 0) {
      // Update existing record
      await db
        .update(investorPitch)
        .set({
          note,
          lastActionTakenOn: new Date(),
        })
        .where(
          and(
            eq(investorPitch.scoutId, scoutId),
            eq(investorPitch.pitchId, pitchId),
          )
        );
    } else {
      // Insert new record
      await db.insert(investorPitch).values({
        scoutId,
        pitchId,
        investorId: userId,
        note,
        lastActionTakenOn: new Date(),
      });
    }

    return NextResponse.json(
      { status: "success", message: "Note saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving investor note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
