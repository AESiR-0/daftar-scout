import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, founderAnswers } from "@/backend/drizzle/models/pitch";
import { users } from "@/backend/drizzle/models/users";
import { pitchTeam } from "@/backend/drizzle/models/pitch"; // Assuming pitchTeam model is defined
import { and, eq, isNotNull, count } from "drizzle-orm";
import { auth } from "@/auth";
import { createNotification } from "@/lib/notifications/insert";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { scouts } from "@/backend/drizzle/models/scouts";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");
    // Validate pitchId
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }

    // Fetch pitch details
    const pitchDetails = await db
      .select({
        id: pitch.id,
      })
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (pitchDetails.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found for this pitchId" },
        { status: 404 }
      );
    }

    // Fetch pitch team details
    const pitchTeamDetails = await db
      .select({
        id: pitchTeam.id,
        userId: pitchTeam.userId,
        userName: users.name,
        userLastName: users.lastName,
        designation: pitchTeam.designation,
        hasApproved: pitchTeam.hasApproved,
      })
      .from(pitchTeam)
      .innerJoin(users, eq(pitchTeam.userId, users.id))
      .where(eq(pitchTeam.pitchId, pitchId));

    const totalTeamMembers = pitchTeamDetails.length;
    const approvedMembers = pitchTeamDetails.filter(member => member.hasApproved).length;
    const pitchApproved = totalTeamMembers === approvedMembers;
    const pitchStatus = await db.select({ status: pitch.status }).from(pitch).where(eq(pitch.id, pitchId));

    // Count founder answers
    const founderAnswersCount = await db
      .select({ count: count() })
      .from(founderAnswers)
      .where(eq(founderAnswers.pitchId, pitchId));

    const hasIncompleteAnswers = founderAnswersCount[0].count < 7;

    // Combine pitch and team details
    const submitted = pitchStatus[0].status ? true : false;
    return NextResponse.json(
      {
        pitch: pitchDetails[0],
        team: pitchTeamDetails,
        pitchApproved: pitchApproved,
        submitted: submitted,
        hasIncompleteAnswers: hasIncompleteAnswers,
        answersCount: founderAnswersCount[0].count
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pitch details:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user from session
    const session = await auth();
    if (!session || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from database using session email
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Get request body
    const { pitchId, askForInvestor, status } = await req.json();

    if (!pitchId) {
      return NextResponse.json({ error: "Pitch ID is required" }, { status: 400 });
    }

    // Verify user is part of the pitch team
    const teamMember = await db
      .select()
      .from(pitchTeam)
      .where(
        and(
          eq(pitchTeam.pitchId, pitchId),
          eq(pitchTeam.userId, userId)
        )
      )
      .limit(1);

    if (!teamMember.length) {
      return NextResponse.json({ error: "Not authorized to modify this pitch" }, { status: 403 });
    }

    // Update team member's approval
    await db.update(pitchTeam).set({
      hasApproved: true
    }).where(
      and(
        eq(pitchTeam.pitchId, pitchId),
        eq(pitchTeam.userId, userId)
      )
    );

    // Get all team members and their approval status
    const allTeamMembers = await db
      .select({
        hasApproved: pitchTeam.hasApproved
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    const totalTeamMembers = allTeamMembers.length;
    const approvedMembers = allTeamMembers.filter(member => member.hasApproved).length;
    const allApproved = totalTeamMembers === approvedMembers;

    // Get pitch details
    const pitchDetails = await db
      .select({
        id: pitch.id,
        pitchName: pitch.pitchName,
        scoutId: pitch.scoutId
      })
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (!pitchDetails.length) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    // Get scout details
    const scoutDetails = await db
      .select({
        scoutId: scouts.scoutId,
        scoutName: scouts.scoutName,
        daftarId: scouts.daftarId
      })
      .from(scouts)
      .where(eq(scouts.scoutId, pitchDetails[0].scoutId || ""))
      .limit(1);

    if (!scoutDetails.length) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    let updatedPitch = pitchDetails[0];
    if (allApproved) {
      const result = await db
        .update(pitch)
        .set({
          askForInvestor: askForInvestor || null,
          status: status || "draft",
          isLocked: true
        })
        .where(eq(pitch.id, pitchId))
        .returning();

      if (!result.length) {
        return NextResponse.json({ error: "Failed to update pitch" }, { status: 500 });
      }
      updatedPitch = result[0];
    }

    // Get pitch team members
    const pitchTeamMembers = await db
      .select({
        userId: pitchTeam.userId
      })
      .from(pitchTeam)
      .where(
        and(
          eq(pitchTeam.pitchId, pitchId),
          isNotNull(pitchTeam.userId)
        )
      );

    // Get scout daftar members
    const daftarMembers = await db
      .select({
        investorId: daftarInvestors.investorId
      })
      .from(daftarInvestors)
      .where(
        and(
          eq(daftarInvestors.daftarId, scoutDetails[0].daftarId || ""),
          eq(daftarInvestors.status, "active"),
          isNotNull(daftarInvestors.investorId)
        )
      );

    // Get current user details
    const currentUser = await db
      .select({
        id: users.id,
        name: users.name
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Send notification to pitch team members
    const validPitchTeamIds = pitchTeamMembers
      .map(member => member.userId)
      .filter((id): id is string => id !== null);

    if (validPitchTeamIds.length > 0) {
      await createNotification({
        type: "updates",
        subtype: "pitch_submitted",
        title: "Pitch Submitted to Scout",
        description: `Your pitch "${pitchDetails[0].pitchName}" has been submitted to scout "${scoutDetails[0].scoutName}"`,
        role: "founder",
        targeted_users: validPitchTeamIds,
        payload: {
          pitchId: pitchId,
          scout_id: scoutDetails[0].scoutId,
          message: `${currentUser[0].name} has submitted the pitch "${pitchDetails[0].pitchName}" to scout "${scoutDetails[0].scoutName}"`
        }
      });
    }

    // Send notification to scout daftar members
    const validDaftarIds = daftarMembers
      .map(member => member.investorId)
      .filter((id): id is string => id !== null);

    if (validDaftarIds.length > 0) {
      await createNotification({
        type: "updates",
        subtype: "pitch_received",
        title: "New Pitch Received",
        description: `A new pitch "${pitchDetails[0].pitchName}" has been submitted to your scout "${scoutDetails[0].scoutName}"`,
        role: "investor",
        targeted_users: validDaftarIds,
        payload: {
          pitchId: pitchId,
          scout_id: scoutDetails[0].scoutId,
          message: `${currentUser[0].name} has submitted a new pitch "${pitchDetails[0].pitchName}" to your scout "${scoutDetails[0].scoutName}"`
        }
      });
    }

    return NextResponse.json({
      message: "Pitch updated successfully",
      pitch: updatedPitch
    });

  } catch (error) {
    console.error("Error updating pitch:", error);
    return NextResponse.json(
      { error: "Failed to update pitch" },
      { status: 500 }
    );
  }
}
