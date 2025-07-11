import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { auth } from "@/auth";
import { offers, offerActions } from "@/backend/drizzle/models/pitch";
import { users } from "@/backend/drizzle/models/users";
import { eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { createNotification } from "@/lib/notifications/insert";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { NotificationPayload } from "@/lib/notifications/type";
import { scouts } from "@/backend/drizzle/models/scouts";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    const pitchId = searchParams.get("pitchId");

    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "scoutId and pitchId are required" },
        { status: 400 }
      );
    }

    const actionTaker = alias(users, "actionTaker");

    // Get offers with user details and actions
    const result = await db
      .select({
        id: offers.id,
        pitch_id: offers.pitchId,
        investor_id: offers.offerBy,
        offer_desc: offers.offerDescription,
        status: offers.offerStatus,
        offer_sent_at: offers.offeredAt,
        created_at: offers.offeredAt,
        // Offer creator details
        creatorName: users.name,
        creatorLastName: users.lastName,
        creatorEmail: users.email,
        creatorRole: users.role,
        // Action details
        action: offerActions.action,
        actionTakenAt: offerActions.actionTakenAt,
        actionTakerName: actionTaker.name,
        actionTakerLastName: actionTaker.lastName,
        actionTakerEmail: actionTaker.email,
        actionTakerRole: actionTaker.role,
        isActionTaken: offerActions.isActionTaken
      })
      .from(offers)
      .leftJoin(users, eq(users.id, offers.offerBy))
      .leftJoin(offerActions, eq(offerActions.offerId, offers.id))
      .leftJoin(actionTaker, eq(actionTaker.id, offerActions.actionTakenBy))
      .where(eq(offers.pitchId, pitchId));

    // Group actions by offer
    const offersMap = result.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          pitch_id: row.pitch_id,
          investor_id: row.investor_id,
          offer_desc: row.offer_desc,
          status: row.status,
          offer_sent_at: row.offer_sent_at,
          created_at: row.created_at,
          userName: row.creatorName,
          userLastName: row.creatorLastName,
          actions: [],
        };
      }

      if (row.action && row.actionTakenAt && row.actionTakerName) {
        acc[row.id].actions.push({
          action: row.action,
          timestamp: row.actionTakenAt,
          takenBy: {
            name: row.actionTakerName,
            lastName: row.actionTakerLastName,
          },
        });
      }

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(Object.values(offersMap));
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, pitchId, investorId, offerDescription, offerStatus } =
      await body;

    // Validate parameters
    if (!scoutId || !pitchId || !investorId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
        { status: 400 }
      );
    }
    if (!offerDescription || typeof offerDescription !== "string") {
      return NextResponse.json(
        { error: "offerDescription is required and must be a string" },
        { status: 400 }
      );
    }
    if (offerStatus && typeof offerStatus !== "string") {
      return NextResponse.json(
        { error: "offerStatus must be a string if provided" },
        { status: 400 }
      );
    }

    // Verify pitch exists and matches scoutId
    const pitchCheck = await db
      .select({
        id: pitch.id,
        scoutId: pitch.scoutId,
        pitchName: pitch.pitchName,
        isLocked: pitch.isLocked,
        investorStatus: pitch.investorStatus,
      })
      .from(pitch)
      .where(and(
        eq(pitch.id, pitchId),
        eq(pitch.scoutId, scoutId)
      ))
      .limit(1);

    const usersList = await db
      .select({ id: pitchTeam.userId })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    const userIds = usersList.map((u) => u.id);
    if (pitchCheck.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found for this scoutId and pitchId" },
        { status: 404 }
      );
    }

    // Check if pitch is locked (accepted)
    if (pitchCheck[0].isLocked || pitchCheck[0].investorStatus === "Accepted") {
      return NextResponse.json(
        { error: "This pitch has been accepted and is no longer accepting new offers" },
        { status: 403 }
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
      } as const)
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (!scoutDetails.length || !scoutDetails[0].scoutName) {
      return NextResponse.json(
        { error: "Scout not found or scout name missing" },
        { status: 404 }
      );
    }

    // Insert new offer
    const newOffer = await db
      .insert(offers)
      .values({
        pitchId,
        offerDescription,
        offerBy: investorId,
        offeredAt: new Date(),
        offerStatus: offerStatus || "pending", // Default to "pending" if not provided
      })
      .returning({
        id: offers.id,
        pitchId: offers.pitchId,
        investorId: offers.offerBy,
        offerDescription: offers.offerDescription,
        offeredAt: offers.offeredAt,
        offerStatus: offers.offerStatus,
      });
    await createNotification({
      type: "updates",
      subtype: "offer_shared",
      title: "New Offer received",
      description: `Offer received from ${investorDetails[0].name} ${investorDetails[0].lastName || ''} via ${scoutDetails[0].scoutName}`,
      role: "founder",
      targeted_users: userIds.filter((id): id is string => id !== null),
      payload: {
        action_at: new Date().toISOString(),
        pitchId,
        pitchName: pitchCheck[0].pitchName,
        action_by: investorId,
        scout_id: scoutId,
        scoutName: scoutDetails[0].scoutName,
        message: offerDescription,
      } satisfies NotificationPayload,
    });
    return NextResponse.json(
      {
        status: "success",
        message: "Offer created successfully",
        offer: newOffer[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating investor offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
