import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch"; // Adjust path if needed

export async function GET() {
  try {
    // Fetch all pitches from the database
    const allPitches = await db.select().from(pitch);

    // Return the pitches as JSON
    return NextResponse.json(allPitches, { status: 200 });
  } catch (error) {
    console.error("Error fetching pitches:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitches" },
      { status: 500 }
    );
  }
}