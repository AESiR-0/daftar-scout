import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
  report,
  reportStatus,
} from "@/backend/drizzle/models/reportAndRequests";
import { users } from "@/backend/drizzle/models/users"; // Adjust path as needed
import { pitch } from "@/backend/drizzle/models/pitch"; // Adjust path as needed
import { count, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // // 📌 Count total reported pitches (listed)
    // const listedReports = await db
    //   .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    //   .from(report)
    //   .execute();

    // // 📌 Count new reported pitches (last 30 days)
    // const newReports = await db
    //   .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    //   .from(report)
    //   .where(sql`created_at > NOW() - INTERVAL '30 days'`)
    //   .execute();

    // // 📌 Ratio of listed to new reported pitches
    // const ratioListedToNew =
    //   listedReports[0].count / Math.max(newReports[0].count, 1);

    // // 📌 Count successful and failed pitch reports
    // const reportOutcomes = await db
    //   .select({
    //     successful: count()
    //       .from(reportStatus)
    //       .where(sql`status = 'Closed'`),
    //     failed: count()
    //       .from(reportStatus)
    //       .where(sql`status = 'Open' OR status = 'Under Review'`),
    //   })
    //   .execute();

    return NextResponse.json({
      //   listed: listedReports[0].count,
      //   new: newReports[0].count,
      //   ratioListedToNew,
      //   topPitches,
      //   scoutRank,
      //   successful: reportOutcomes[0].successful,
      //   failed: reportOutcomes[0].failed,
      message: "Report stats fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching pitch report stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
