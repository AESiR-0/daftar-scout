import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch"; // Adjust path if needed
import { auth } from "@/auth";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user } = session;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user?.email) {
      return NextResponse.json(
        { error: "Invalid user email" },
        { status: 400 }
      );
    }
    const userExist = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);
    console.log("User exists:", userExist);
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
