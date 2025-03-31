import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database"; // Adjust path
import { pitch } from "@/backend/drizzle/models/pitch";
import { sql, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Fetch pitch count by stage
    const stageFrequency = await db
      .select({
        stage: pitch.stage,
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(pitch)
      .groupBy(pitch.stage)
      .execute();

    // Total pitches for ratio calculation
    const totalPitches = stageFrequency.reduce((acc, s) => acc + s.count, 0);

    // Categorize frequency into High, Mid, Low
    const highThreshold = totalPitches * 0.5; // 50%+
    const midThreshold = totalPitches * 0.2; // 20%-50%
    const lowThreshold = totalPitches * 0.1; // 10%-20%

    const categorizedFrequency = stageFrequency.map((s) => ({
      stage: s.stage,
      count: s.count,
      category:
        s.count >= highThreshold
          ? "High"
          : s.count >= midThreshold
          ? "Mid"
          : s.count >= lowThreshold
          ? "Low"
          : "Very Low",
    }));

    // Count successful & failed pitches per stage
    const successFailure = await db
      .select({
        stage: pitch.stage,
        successful:
          sql<number>`COUNT(*) FILTER (WHERE is_completed = TRUE)`.mapWith(
            Number
          ),
        failed:
          sql<number>`COUNT(*) FILTER (WHERE is_completed = FALSE)`.mapWith(
            Number
          ),
      })
      .from(pitch)
      .groupBy(pitch.stage)
      .execute();

    // Fetch audience, traffic & revenue metrics per stage

    return NextResponse.json({
      frequency: categorizedFrequency,
      successFailure,
    });
  } catch (error) {
    console.error("Error fetching pitch data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
