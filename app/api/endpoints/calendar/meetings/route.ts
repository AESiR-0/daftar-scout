import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { meetings } from "@/backend/drizzle/models/meetings";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's meetings
    const userMeetings = await db
      .select()
      .from(meetings)
      .where(eq(meetings.userId, user.id))
      .orderBy(meetings.startTime);

    return NextResponse.json(userMeetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
} 