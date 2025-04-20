import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { focusSectors } from "@/backend/drizzle/models/pitch";

export async function GET(req: NextRequest) {
  try {
    const sectors = await db.select().from(focusSectors);
    return NextResponse.json(sectors);
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}