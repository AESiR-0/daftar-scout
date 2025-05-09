import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { offers, offerActions, pitchTeam } from "@/backend/drizzle/models/pitch";
import { pitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";
import { users } from "@/backend/drizzle/models/users";
import { scouts, daftarScouts } from "@/backend/drizzle/models/scouts";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { NotificationPayload } from "@/lib/notifications/type";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, pitchId, investorId, offerId, action, notes } = body;

    // Validate parameters
    if (!scoutId || !pitchId || !investorId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
        { status: 400 }
      );
    }
    if (!offerId || parseInt(offerId) < 1) {
      return NextResponse.json(
        { error: "offerId is required and must be a positive integer" },
        { status: 400 }
      );
    }
    if (!action || !["withdrawn", "declined"].includes(action)) {
      return NextResponse.json(
        { error: "action is required and must be either withdrawn or declined" },
        { status: 400 }
      );
    }
    if (notes && typeof notes !== "string") {
      return NextResponse.json(
        { error: "notes must be a string if provided" },
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

    // Get all daftar members (investors) for these daftars
    const daftarMembers = await db
      .select({
        investorId: daftarInvestors.investorId,
      })
      .from(daftarInvestors)
      .where(eq(daftarInvestors.status, "active"));

    // Get pitch team members
    const teamMembers = await db
      .select({
        userId: pitchTeam.userId,
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    // Filter out null user IDs and combine all target users
    const validTeamMembers = teamMembers
      .map(member => member.userId)
      .filter((id): id is string => id !== null);

    const validDaftarMembers = daftarMembers
      .map(member => member.investorId)
      .filter((id): id is string => id !== null);

    // Verify the offer exists and belongs to the investor
    const offerCheck = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.id, offerId),
          eq(offers.pitchId, pitchId),
          eq(offers.offerBy, investorId)
        )
      )
      .limit(1);

    if (offerCheck.length === 0) {
      return NextResponse.json(
        { error: "Offer not found or not associated with this investor" },
        { status: 404 }
      );
    }

    // Insert or update the offer action
    const existingAction = await db
      .select()
      .from(offerActions)
      .where(eq(offerActions.offerId, offerId))
      .limit(1);

    if (existingAction.length > 0) {
      // Update existing action
      await db
        .update(offerActions)
        .set({
          isActionTaken: true,
          action,
          actionTakenBy: investorId,
          actionTakenAt: new Date(),
        })
        .where(eq(offerActions.offerId, offerId));
    } else {
      // Insert new action
      await db.insert(offerActions).values({
        offerId,
        isActionTaken: true,
        action,
        actionTakenBy: investorId,
        actionTakenAt: new Date(),
      });
    }

    // Update offer status and description in offers table
    await db
      .update(offers)
      .set({
        offerStatus: action,
        offerDescription: notes
          ? `${offerCheck[0].offerDescription} | Notes: ${notes}`
          : offerCheck[0].offerDescription,
      })
      .where(eq(offers.id, offerId));

    // If action is decline, update pitch status
    if (action === "declined") {
      await db
        .update(pitch)
        .set({
          status: "declined",
        })
        .where(eq(pitch.id, pitchId));
    }

    // Create notifications based on action type
    type NotificationInfo = {
      type: "updates" | "alert";
      subtype: string;
      title: string;
      description: string;
    };

    const notificationData: NotificationInfo = action === "withdrawn" 
      ? {
          type: "updates",
          subtype: "offer_withdrawn",
          title: `Offer for pitch "${pitchCheck[0].pitchName}" withdrawn`,
          description: `Offer for pitch "${pitchCheck[0].pitchName}" withdrawn by ${investorDetails[0].name} ${investorDetails[0].lastName || ''} via ${scoutDetails[0].scoutName}`,
        }
      : {
          type: "alert",
          subtype: "pitch_declined_by_investor",
          title: `Pitch "${pitchCheck[0].pitchName}" declined`,
          description: `Pitch "${pitchCheck[0].pitchName}" was declined by ${investorDetails[0].name} ${investorDetails[0].lastName || ''} via ${scoutDetails[0].scoutName}`,
        };

    // Create single notification for all members
    await createNotification({
      type: notificationData.type,
      subtype: notificationData.subtype,
      title: notificationData.title,
      description: notificationData.description,
      targeted_users: [...validTeamMembers, ...validDaftarMembers],
      payload: {
        action_at: new Date().toISOString(),
        pitchId,
        pitchName: pitchCheck[0].pitchName,
        action_by: investorId,
        scout_id: scoutId,
        scoutName: scoutDetails[0].scoutName,
        message: notes || undefined,
      } satisfies NotificationPayload,
    });

    return NextResponse.json(
      { 
        status: "success", 
        message: action === "withdrawn" 
          ? "Offer withdrawn successfully" 
          : "Pitch declined successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling offer action:", error);
    return NextResponse.json(
      { error: "Failed to process offer action" },
      { status: 500 }
    );
  }
}

