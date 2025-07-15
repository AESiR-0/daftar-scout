import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { and, eq, or } from "drizzle-orm";
import { auth } from "@/auth";
import { createNotification } from "@/lib/notifications/insert";
import {
  users,
  userLanguages,
  languages,
} from "@/backend/drizzle/models/users";
import { sendNotificationEmail } from "@/lib/notifications/listen";
import { inArray } from "drizzle-orm";

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
        hasApproved: pitchTeam.hasApproved,
        invitationAccepted: pitchTeam.invitationAccepted,
        firstName: users.name,
        lastName: users.lastName,
        email: users.email,
        location: users.location,
        gender: users.gender,
        image: users.image,
        countryCode: users.countryCode,
        phone: users.number,
        joinDate: users.createdAt,
      })
      .from(pitchTeam)
      .leftJoin(users, eq(pitchTeam.userId, users.id))
      .where(eq(pitchTeam.pitchId, pitchId));

    // Fetch languages for each team member
    const userIds = teamData.map((member) => member.userId);
    const filteredUserIds = userIds.filter((id): id is string => id !== null);
    const userLanguagesData = await db
      .select({
        userId: userLanguages.userId,
        language: languages.language_name,
      })
      .from(userLanguages)
      .leftJoin(languages, eq(userLanguages.languageId, languages.id))
      .where(inArray(userLanguages.userId, filteredUserIds));

    // Group languages by userId
    const languagesByUser = userLanguagesData.reduce((acc, curr) => {
      if (!acc[curr.userId]) {
        acc[curr.userId] = [];
      }
      if (curr.language) {
        acc[curr.userId].push(curr.language);
      }
      return acc;
    }, {} as Record<string, string[]>);

    // Combine team data with languages
    const enrichedTeamData = teamData.map((member) => ({
      ...member,
      language: member.userId ? languagesByUser[member.userId] || [] : [],
      status: member.invitationAccepted ? "active" : "pending",
    }));

    return NextResponse.json(
      {
        message: "Team members fetched successfully",
        data: enrichedTeamData,
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

    // Prevent self-invite
    if (email.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot invite yourself to the team." },
        { status: 400 }
      );
    }

    // Get invited user details
    const userExist = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), or(eq(users.role, "founder"), eq(users.role, "Founder"))))
      .limit(1);

    if (userExist.length === 0) {
      // Check if user exists but is an investor
      const isInvestor = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), or(eq(users.role, "investor"), eq(users.role, "Investor"))))
        .limit(1);

      if (isInvestor.length > 0) {
        return NextResponse.json(
          { error: "Cannot invite an investor to a pitch team. Only founders can be invited to a pitch." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }

    const userId = userExist[0].id;
    const invitedUserName = `${userExist[0].name || ''} ${userExist[0].lastName || ''}`.trim();

    // Get pitch details
    const pitchExists = await db
      .select({ name: pitch.pitchName })
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (pitchExists.length === 0) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    const { name: pitchName } = pitchExists[0];

    // Get existing team members
    const existingTeamMembers = await db
      .select({ userId: pitchTeam.userId })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    const teamMemberIds = existingTeamMembers
      .map(member => member.userId)
      .filter((id): id is string => id !== null && id !== userId);

    const newTeamMember = await db
      .insert(pitchTeam)
      .values({
        userId,
        pitchId,
        designation: designation || "Team Member",
      })
      .returning();

    // Notification for invited user (email with accept/reject)
    await createNotification({
      type: "updates",
      subtype: "pitch_team_invite",
      title: "Pitch Team Invitation",
      description: `You have been invited to join ${pitchName} as ${designation || "Team Member"}`,
      targeted_users: [userId],
      role: "founder",
      payload: {
        pitchId,
        pitchName,
        currentUsername: user.name || "", // inviter's name
        currentUserDesignation: "Founder", // fallback if not set
        invitedUsername: invitedUserName,
        invitedUserDesignation: designation || "Team Member",
        action: "invite",
        action_by: user.id,
        action_at: new Date().toISOString(),
      },
    });

    // Send email notification to invited user
    await sendNotificationEmail(
      {
        type: "updates",
        targeted_users: [userId],
        role: "founder",
        payload: {
          pitchId,
          designation: designation || "Team Member",
          message: `You have been invited to join ${pitchName} as ${designation || "Team Member"}`,
          action: "invite",
          action_by: user.id,
          action_at: new Date().toISOString(),
        },
        id: "",
        created_at: new Date().toISOString(),
      },
      userId
    );

    // Notification for existing team members
    if (teamMemberIds.length > 0) {
      await createNotification({
        type: "updates",
        subtype: "team_invite",
        title: "New Team Member Invited",
        description: `${invitedUserName} was invited to ${pitchName} as ${designation || "Team Member"}`,
        targeted_users: teamMemberIds,
        role: "founder",
        payload: {
          pitchId,
          designation: designation || "Team Member",
          message: `${invitedUserName} was invited to ${pitchName} as ${designation || "Team Member"}`,
          action: "team_invite",
          action_by: user.id,
          action_at: new Date().toISOString(),
        },
      });
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user } = session;
    if (!user || !user.id) {
      return NextResponse.json({ error: "Invalid user session" }, { status: 400 });
    }
    const body = await req.json();
    const { pitchId, userId } = body;
    if (!pitchId || !userId) {
      return NextResponse.json({ error: "pitchId and userId are required" }, { status: 400 });
    }
    // Only allow removing if the user is the pitch owner or removing themselves
    // (You can adjust this logic as needed)
    // Remove the member from the pitch team
    const deleted = await db.delete(pitchTeam)
      .where(and(eq(pitchTeam.pitchId, pitchId), eq(pitchTeam.userId, userId)))
      .returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Team member not found or not removed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Team member removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json({ error: "Failed to remove team member" }, { status: 500 });
  }
}
