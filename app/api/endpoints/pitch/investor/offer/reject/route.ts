import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";
import { users } from "@/backend/drizzle/models/users";
import { scouts } from "@/backend/drizzle/models/scouts";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { NotificationPayload } from "@/lib/notifications/type";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, pitchId, investorId, reason } = body;

    // Validate parameters
    if (!scoutId || !pitchId || !investorId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
        { status: 400 }
      );
    }
    if (reason && typeof reason !== "string") {
      return NextResponse.json(
        { error: "reason must be a string if provided" },
        { status: 400 }
      );
    }

    // Verify pitch exists and matches scoutId
    const pitchCheck = await db
      .select({
        id: pitch.id,
        scoutId: pitch.scoutId,
        pitchName: pitch.pitchName,
      })
      .from(pitch)
      .where(and(eq(pitch.id, pitchId), eq(pitch.scoutId, scoutId)))
      .limit(1);

    if (pitchCheck.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found for this scoutId and pitchId" },
        { status: 404 }
      );
    }

    // Get investor details
    const investorDetails = await db
      .select({
        name: users.name,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, investorId))
      .limit(1);

    if (!investorDetails.length) {
      return NextResponse.json(
        { error: "Investor not found" },
        { status: 404 }
      );
    }

    // Get scout details
    const scoutDetails = await db
      .select({
        scoutName: scouts.scoutName,
      })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (!scoutDetails.length) {
      return NextResponse.json(
        { error: "Scout not found" },
        { status: 404 }
      );
    }

    // Get pitch team members
    const teamMembers = await db
      .select({
        userId: pitchTeam.userId,
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    // Get all daftar members (investors)
    const daftarMembers = await db
      .select({
        investorId: daftarInvestors.investorId,
      })
      .from(daftarInvestors)
      .where(eq(daftarInvestors.status, "active"));

    // Filter out null user IDs and combine all target users
    const validTeamMembers = teamMembers
      .map(member => member.userId)
      .filter((id): id is string => id !== null);

    const validDaftarMembers = daftarMembers
      .map(member => member.investorId)
      .filter((id): id is string => id !== null);

    // Update pitch status to rejected
    await db
      .update(pitch)
      .set({
        status: "rejected",
      })
      .where(eq(pitch.id, pitchId));

    // Update investor status to rejected
    await db
      .update(pitch)
      .set({
        status: "rejected",
        investorStatus: "rejected",
      })
      .where(eq(pitch.id, pitchId));

    // Create notification for all members
    await createNotification({
      type: "alert",
      subtype: "pitch_declined_by_investor",
      title: `Pitch "${pitchCheck[0].pitchName}" declined`,
      description: `Pitch "${pitchCheck[0].pitchName}" was declined by ${investorDetails[0].name} ${investorDetails[0].lastName || ''} via ${scoutDetails[0].scoutName}`,
      targeted_users: [...validTeamMembers, ...validDaftarMembers],
      payload: {
        action_at: new Date().toISOString(),
        pitchId,
        pitchName: pitchCheck[0].pitchName,
        action_by: investorId,
        scout_id: scoutId,
        scoutName: scoutDetails[0].scoutName,
        message: reason || undefined,
      } satisfies NotificationPayload,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Pitch rejected successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting pitch:", error);
    return NextResponse.json(
      { error: "Failed to reject pitch" },
      { status: 500 }
    );
  }
}
