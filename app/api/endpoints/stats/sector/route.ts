import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database"; // Adjust based on your setup
import { daftar } from "@/backend/drizzle/models/daftar";
import {
  pitch,
  focusSectors,
  pitchFocusSectors,
} from "@/backend/drizzle/models/pitch";
import { scouts } from "@/backend/drizzle/models/scouts";
import { sql, eq, gt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Count active (listed) entities
    const [listed] = await db
      .select({
        daftar: sql<number>`COUNT(*)`.mapWith(Number),
        pitch: sql<number>`COUNT(*)`.mapWith(Number),
        scout: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(daftar)
      .where(eq(daftar.isActive, true))
      .leftJoin(pitch, eq(pitch.isCompleted, true))
      .leftJoin(scouts, eq(scouts.isArchived, false));

    // Count new entities (created in the last 30 days)
    const [newEntries] = await db
      .select({
        daftar: sql<number>`COUNT(*)`.mapWith(Number),
        pitch: sql<number>`COUNT(*)`.mapWith(Number),
        scout: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(daftar)
      .where(gt(daftar.createdAt, sql`NOW() - INTERVAL '30 days'`))
      .leftJoin(pitch, gt(pitch.createdAt, sql`NOW() - INTERVAL '30 days'`))
      .leftJoin(
        scouts,
        gt(scouts.scoutCreatedAt, sql`NOW() - INTERVAL '30 days'`)
      );

    // Calculate ratio of listed to new (avoiding division by zero)
    const ratioListedToNew = {
      daftar: listed.daftar / Math.max(newEntries.daftar, 1),
      pitch: listed.pitch / Math.max(newEntries.pitch, 1),
      scout: listed.scout / Math.max(newEntries.scout, 1),
    };

    // Count "Asked" (Pitches asking for investors)
    const [askedCount] = await db
      .select({ asked: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(pitch)
      .where(eq(pitch.askForInvestor, "true"));

    // Count "Tagged" (Focus Sectors linked to pitches)
    const [taggedCount] = await db
      .select({
        tagged: sql<number>`COUNT(DISTINCT focus_sector_id)`.mapWith(Number),
      })
      .from(pitchFocusSectors);

    // Count successful and failed pitches
    const [successFailure] = await db
      .select({
        successful:
          sql<number>`COUNT(*) FILTER (WHERE is_completed = TRUE)`.mapWith(
            Number
          ),
        failed:
          sql<number>`COUNT(*) FILTER (WHERE is_completed = FALSE)`.mapWith(
            Number
          ),
      })
      .from(pitch);

    // Get frequency of each focus sector used
    const sectorCombinations = await db
      .select({
        sector: focusSectors.sectorName,
        frequency: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(pitchFocusSectors)
      .leftJoin(
        focusSectors,
        eq(pitchFocusSectors.focusSectorId, focusSectors.id)
      )
      .groupBy(focusSectors.sectorName)
      .execute();

    return NextResponse.json({
      listed,
      new: newEntries,
      ratioListedToNew,
      combo: { asked: askedCount.asked, tagged: taggedCount.tagged },
      successFailure,
      sectorCombinations,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
