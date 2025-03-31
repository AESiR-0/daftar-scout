import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
  featureRequests,
  featureTracking,
  postDevAnalysis,
} from "@/backend/drizzle/models/reportAndRequests";
import { sql, count, avg } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Count by status
    const statusCount = await db
      .select({
        status: featureTracking.status,
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(featureTracking)
      .groupBy(featureTracking.status)
      .execute();

    // Average development time
    const avgDevTime = await db
      .select({ avgTime: sql<number>`AVG(estimated_time)`.mapWith(Number) })
      .from(featureTracking)
      .execute();

    // Customer Satisfaction Score (CSAT)
    const csatAvg = await db
      .select({
        avgCSAT: sql<number>`AVG(customer_satisfaction)`.mapWith(Number),
      })
      .from(postDevAnalysis)
      .execute();

    // Feature count per complexity level
    const complexityCount = await db
      .select({
        complexity: featureTracking.complexity,
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(featureTracking)
      .groupBy(featureTracking.complexity)
      .execute();

    return NextResponse.json({
      statusCount,
      avgDevTime: avgDevTime[0]?.avgTime || 0,
      avgCSAT: csatAvg[0]?.avgCSAT || 0,
      complexityCount,
    });
  } catch (error) {
    console.error("Error fetching feature stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature stats" },
      { status: 500 }
    );
  }
}
