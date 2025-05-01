import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitchTeam } from "@/backend/drizzle/models/pitch";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest) {
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
    const { pitchId, userId, designation } = body;

    if (!pitchId || !userId || !designation) {
      return NextResponse.json(
        { error: "pitchId, userId and designation are required" },
        { status: 400 }
      );
    }

    // Update the team member's designation
    const updatedMember = await db
      .update(pitchTeam)
      .set({ designation })
      .where(
        and(
          eq(pitchTeam.pitchId, pitchId),
          eq(pitchTeam.userId, userId)
        )
      )
      .returning();

    if (updatedMember.length === 0) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Designation updated successfully",
      data: updatedMember[0],
    });
  } catch (error) {
    console.error("Error updating designation:", error);
    return NextResponse.json(
      { error: "Failed to update designation" },
      { status: 500 }
    );
  }
} 