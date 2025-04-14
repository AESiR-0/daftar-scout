import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { auth } from "@/auth";
import { users } from "@/backend/drizzle/models/users";
import { eq, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    if (!user?.email) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    // Fetch user record (to get user.id)
    const userExist = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    const dbUser = userExist[0];
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all pitchTeam entries for this user
    const userPitchTeams = await db
      .select({ pitchId: pitchTeam.pitchId })
      .from(pitchTeam)
      .where(eq(pitchTeam.userId, dbUser.id));

    const pitchIds = userPitchTeams
      .map((team) => team.pitchId)
      .filter((id): id is string => id !== null);

    // Fetch pitches only where user is on the team
    const userPitches = await db
      .select()
      .from(pitch)
      .where(inArray(pitch.id, pitchIds));

    return NextResponse.json(userPitches, { status: 200 });
  } catch (error) {
    console.error("Error fetching pitches:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitches" },
      { status: 500 }
    );
  }
}
