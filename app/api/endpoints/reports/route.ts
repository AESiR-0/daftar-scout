import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { report } from "@/backend/drizzle/models/reportAndRequests";

export async function GET(req: NextRequest) {
  try {
    const reports = await db.select().from(report).execute();
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reportedBy, pitchId, reportDescription, scoutId } =
      await req.json();
    await db
      .insert(report)
      .values({ reportedBy, pitchId, reportDescription, scoutId })
      .execute();
    return NextResponse.json({ message: "Pitch reported" }, { status: 201 });
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
