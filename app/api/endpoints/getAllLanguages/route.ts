import { NextResponse } from "next/server";
import { db } from "@/backend/database"; // Adjust the path based on your project structure
import { languages } from "@/backend/drizzle/models/users"; // Adjust based on your schema location
import { eq, ilike } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const data = await db
      .select()
      .from(languages)
      .where(search ? ilike(languages.language_name, `%${search}%`) : undefined)
      .limit(20);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch languages" },
      { status: 500 }
    );
  }
}
