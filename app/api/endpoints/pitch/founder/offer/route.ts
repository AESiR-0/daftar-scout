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
        userName: users.name,
        userLastName: users.lastName,
        action: offerActions.action,
        actionTakenAt: offerActions.actionTakenAt,
        actionTakerName: actionTaker.name,
        actionTakerLastName: actionTaker.lastName,
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
          userName: row.userName,
          userLastName: row.userLastName,
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
      // For accepted offers, notify everyone (empty array means all users)
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
