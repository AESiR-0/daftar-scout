import { NextResponse } from "next/server";
import { db } from "@/backend/database"; // Adjust the path based on your project structure
import { languages } from "@/backend/drizzle/models/users"; // Adjust based on your schema location

export async function GET() {
  try {
    const data = await db.select().from(languages);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
