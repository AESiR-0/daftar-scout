import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { users } from "@/backend/drizzle/models/users";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { createNotification } from "@/lib/notifications/insert";

// PATCH: Accept or decline pitch invitation
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { pitchId, action } = body;

    if (!pitchId || !["accepted", "declined"].includes(action)) {
      return NextResponse.json(
        { error: "pitchId and valid action (accepted/declined) are required" },
        { status: 400 }
      );
    }

    // Check if user is part of the pitch team
    const existingEntry = await db
      .select()
      .from(pitchTeam)
      .where(and(eq(pitchTeam.pitchId, pitchId), eq(pitchTeam.userId, user.id)))
      .limit(1);

    if (existingEntry.length === 0) {
      return NextResponse.json(
        { error: "You are not invited to this pitch" },
        { status: 404 }
      );
    }

    // Update the team status
    await db
      .update(pitchTeam)
      .set({ hasApproved: action === "accepted" })
      .where(
        and(eq(pitchTeam.pitchId, pitchId), eq(pitchTeam.userId, user.id))
      );

    // Get pitch name
    const pitchDetails = await db
      .select({ name: pitch.pitchName })
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    const pitchName = pitchDetails[0]?.name || "Unnamed Pitch";

    // Notify team members (optional: just the inviter if tracked)
    const allMembers = await db
      .select({ userId: pitchTeam.userId })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    const targetUserIds = allMembers
      .map((m) => m.userId)
      .filter((id) => id !== user.id);

    if (targetUserIds.length > 0) {
      await createNotification({
        type: "updates",
        subtype: action === "accepted" ? "team_join" : "team_leave",
        title: `Pitch Invitation ${
          action === "accepted" ? "Accepted" : "Declined"
        }`,
        description: `${
          user.name || "A member"
        } has ${action} your invitation to join "${pitchName}"`,
        targeted_users: targetUserIds.filter((id): id is string => id !== null),
        payload: {
          action,
          action_by: user.id,
          pitchName,
        },
      });
    }

    return NextResponse.json({
      message: `Invitation ${action} successfully`,
    });
  } catch (error) {
    console.error("Error updating invite status:", error);
    return NextResponse.json(
      { error: "Failed to update invite status" },
      { status: 500 }
    );
  }
}
