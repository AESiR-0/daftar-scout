import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { auth } from "@/auth";
import {
  offers,
  offerActions,
  pitchTeam,
  pitch,
  pitchFocusSectors,
  focusSectors,
} from "@/backend/drizzle/models/pitch";
import { scouts } from "@/backend/drizzle/models/scouts";
import { users } from "@/backend/drizzle/models/users";
import { daftarScouts } from "@/backend/drizzle/models/scouts";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { eq, and, inArray } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";
import { alias } from "drizzle-orm/pg-core";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");

    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }

    // First query: Get all offers with user details
    const offersResult = await db
      .select({
        id: offers.id,
        pitch_id: offers.pitchId,
        investor_id: offers.offerBy,
        offer_desc: offers.offerDescription,
        status: offers.offerStatus,
        offer_sent_at: offers.offeredAt,
        created_at: offers.offeredAt,
        userName: users.name,
        userLastName: users.lastName,
        scoutName: scouts.scoutName,
      })
      .from(offers)
      .leftJoin(users, eq(users.id, offers.offerBy))
      .leftJoin(pitch, eq(pitch.id, offers.pitchId))
      .leftJoin(scouts, eq(scouts.scoutId, pitch.scoutId))
      .where(eq(offers.pitchId, pitchId));

    // Second query: Get all actions for these offers
    const offerIds = offersResult.map(offer => offer.id);
    const actionsResult = await db
      .select({
        offerId: offerActions.offerId,
        action: offerActions.action,
        actionTakenAt: offerActions.actionTakenAt,
        actionTakerName: users.name,
        actionTakerLastName: users.lastName,
      })
      .from(offerActions)
      .leftJoin(users, eq(users.id, offerActions.actionTakenBy))
      .where(inArray(offerActions.offerId, offerIds));

    // Group actions by offer ID
    const actionsByOffer = actionsResult.reduce<Record<string, any[]>>((acc, action) => {
      if (action.offerId !== null) {
        if (!acc[action.offerId]) {
          acc[action.offerId] = [];
        }
        acc[action.offerId].push({
          action: action.action,
          timestamp: action.actionTakenAt?.toISOString() || "",
          takenBy: {
            name: action.actionTakerName,
            lastName: action.actionTakerLastName,
          },
        });
      }
      return acc;
    }, {});

    // Combine offers with their actions
    const finalOffers = offersResult.map(offer => ({
      id: offer.id,
      pitch_id: offer.pitch_id,
      investor_id: offer.investor_id,
      offer_desc: offer.offer_desc,
      status: offer.status,
      offer_sent_at: offer.offer_sent_at,
      created_at: offer.created_at,
      userName: offer.userName,
      userLastName: offer.userLastName,
      scoutName: offer.scoutName,
      actions: actionsByOffer[offer.id] || [],
    }));

    // Sort actions by timestamp in descending order for each offer
    finalOffers.forEach(offer => {
      offer.actions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    return NextResponse.json(finalOffers);
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

    // Get user details
    const userDetails = await db
      .select({
        id: users.id,
        name: users.name,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (!userDetails.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const actionTakenBy = userDetails[0].id;
    const body = await req.json();
    const { offerId, action, notes, pitchId } = body;

    // Validate input
    if (!pitchId || !offerId || !action || !actionTakenBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the offer details
    const offerDetails = await db
      .select({
        id: offers.id,
        offerBy: offers.offerBy,
      })
      .from(offers)
      .where(eq(offers.id, offerId))
      .limit(1);

    if (!offerDetails.length) {
      return NextResponse.json(
        { error: "Offer not found or not associated with this pitch" },
        { status: 404 }
      );
    }

    // Update offer status
    await db
      .update(offers)
      .set({
        offerStatus: action,
      })
      .where(eq(offers.id, offerId));

    // Record the action
    await db.insert(offerActions).values({
      offerId,
      isActionTaken: true,
      action,
      actionTakenBy,
      actionTakenAt: new Date(),
    });

    let targetedUsers: string[] = [];

    if (action === "accepted") {
      // For accepted offers, lock the pitch and prevent new offers
      await db
        .update(pitch)
        .set({
          investorStatus: "Accepted",
          isLocked: true,
        })
        .where(eq(pitch.id, pitchId));

      // Notify all users about the acceptance
      targetedUsers = [];
    } else {
      // Get pitch details to find scoutId
      const pitchDetails = await db
        .select({
          scoutId: pitch.scoutId,
          pitchName: pitch.pitchName,
        })
        .from(pitch)
        .where(eq(pitch.id, pitchId))
        .limit(1);

      if (pitchDetails.length > 0 && pitchDetails[0].scoutId) {
        // Get scout details
        const scoutDetails = await db
          .select({
            scoutName: scouts.scoutName,
          })
          .from(scouts)
          .where(eq(scouts.scoutId, pitchDetails[0].scoutId))
          .limit(1);

        // Get all Daftar IDs associated with the scout
        const daftarIds = await db
          .select({
            daftarId: daftarScouts.daftarId,
          })
          .from(daftarScouts)
          .where(eq(daftarScouts.scoutId, pitchDetails[0].scoutId));

        // Filter out any null daftarIds
        const validDaftarIds = daftarIds
          .map(d => d.daftarId)
          .filter((id): id is string => id !== null);

        // Get all investors from these Daftar groups
        const investors = validDaftarIds.length > 0
          ? await db
            .select({
              investorId: daftarInvestors.investorId,
            })
            .from(daftarInvestors)
            .where(inArray(daftarInvestors.daftarId, validDaftarIds))
          : [];

        // Get pitch team members
        const pitchTeamMembers = await db
          .select({
            userId: pitchTeam.userId,
          })
          .from(pitchTeam)
          .where(eq(pitchTeam.pitchId, pitchId));

        // Combine all users, filter nulls, and remove duplicates
        targetedUsers = [
          ...new Set([
            ...pitchTeamMembers.map((m) => m.userId),
            ...investors.map((i) => i.investorId),
            offerDetails[0].offerBy,
          ].filter((id): id is string => id !== null)),
        ];

        // Create notification
        await createNotification({
          type: action === "accepted" ? "news" : "alert",
          subtype: action === "accepted" ? "offer_accepted" : "offer_rejected",
          title: `Offer for pitch "${pitchDetails[0].pitchName}" ${action}`,
          description: `Offer for pitch "${pitchDetails[0].pitchName}" has been ${action} by ${userDetails[0].name
            } ${userDetails[0].lastName || ""} via ${scoutDetails[0]?.scoutName || "scout"}`,
          role: "investor",
          targeted_users: targetedUsers,
          payload: {
            action_at: new Date().toISOString(),
            message: notes,
            pitchId,
            pitchName: pitchDetails[0].pitchName,
            scout_id: pitchDetails[0].scoutId,
            scoutName: scoutDetails[0]?.scoutName,
          },
        });
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Offer action recorded successfully",
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}
