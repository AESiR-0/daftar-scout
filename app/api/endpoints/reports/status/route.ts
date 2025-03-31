import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { reportStatus } from "@/backend/drizzle/models/reportAndRequests";

export async function GET(req: NextRequest) {
  try {
    const statuses = await db.select().from(reportStatus).execute();
    return NextResponse.json(statuses);
  } catch (error) {
    console.error("Error fetching report statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch statuses" },
      { status: 500 }
    );
  }
}
