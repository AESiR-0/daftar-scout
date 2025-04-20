import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { and, eq, or } from "drizzle-orm";
import { auth } from "@/auth";
import { createNotification } from "@/lib/notifications/insert";
import { users } from "@/backend/drizzle/models/users";

// GET: Fetch team members for a pitch by pitchId from request body
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
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");

    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }

    // Check if the pitch exists
    const pitchExists = await db
      .select()
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (pitchExists.length === 0) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    // Fetch team members (userIds) for the given pitchId
    const teamData = await db
      .select({
        id: pitchTeam.id,
        userId: pitchTeam.userId,
        pitchId: pitchTeam.pitchId,
        designation: pitchTeam.designation,
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    return NextResponse.json(
      {
        message: "Team members fetched successfully",
        data: teamData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pitch team:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch team" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { pitchId, email, designation } = body;

    if (!pitchId || !email) {
      return NextResponse.json(
        { error: "pitchId and email are required" },
        { status: 400 }
      );
    }

    const userExist = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.role, "founder")))
      .limit(1);

    if (userExist.length === 0) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }

    const userId = userExist[0].id;

    const pitchExists = await db
      .select({ name: pitch.pitchName })
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (pitchExists.length === 0) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    const { name: pitchName } = pitchExists[0];

    const newTeamMember = await db
      .insert(pitchTeam)
      .values({
        userId,
        pitchId,
        designation: designation || "Team Member",
      })
      .returning();

    // Notification for invited user
    await createNotification({
      type: "updates",
      title: "Pitch Invitation",
      description: `You are invited to the ${pitchName}`,
      targeted_users: [userId],
      role: "founder",
    });

    return NextResponse.json(
      {
        message: "Team member added successfully",
        data: newTeamMember[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding team member:", error);

    if (error.code === "23503") {
      return NextResponse.json(
        {
          error: error.detail.includes("user_id")
            ? "Invalid userId: user does not exist"
            : "Invalid pitchId: pitch does not exist",
        },
        { status: 400 }
      );
    }

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This user is already a team member for this pitch" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}
