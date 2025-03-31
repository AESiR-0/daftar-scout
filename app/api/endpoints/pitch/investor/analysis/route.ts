import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { investorPitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest
) {
  try {
    const body = await req.json();
    const { scoutId, pitchId } = await body;

    // Validate parameters
    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
        { status: 400 }
      );
    }

    // Fetch the analysis
    const result = await db
      .select({
        analysis: investorPitch.analysis,
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
        { error: "No analysis found for this scoutId, pitchId, and investorId" },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis: result[0].analysis || "" }, { status: 200 });
  } catch (error) {
    console.error("Error fetching investor analysis:", error);
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { scoutId: string; pitchId: string } }
) {
  try {
    const { scoutId, pitchId } = params;
    const body = await req.json();
    const { investorId, analysis } = body;

    // Validate parameters
    if (!scoutId || !pitchId || !investorId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
        { status: 400 }
      );
    }
    if (typeof analysis !== "string") {
      return NextResponse.json(
        { error: "analysis must be a string" },
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
          eq(investorPitch.investorId, investorId)
        )
      )
      .limit(1);

    if (existingRecord.length > 0) {
      // Update existing record
      await db
        .update(investorPitch)
        .set({
          analysis,
          lastActionTakenOn: new Date(),
        })
        .where(
          and(
            eq(investorPitch.scoutId, scoutId),
            eq(investorPitch.pitchId, pitchId),
            eq(investorPitch.investorId, investorId)
          )
        );
    } else {
      // Insert new record
      await db.insert(investorPitch).values({
        scoutId,
        pitchId,
        investorId,
        analysis,
        lastActionTakenOn: new Date(),
      });
    }

    return NextResponse.json(
      { status: "success", message: "Analysis saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving investor analysis:", error);
    return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
  }
}