import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { offers, pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";
import { users } from "@/backend/drizzle/models/users";
import { scouts } from "@/backend/drizzle/models/scouts";
import { NotificationPayload } from "@/lib/notifications/type";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId") || null;
    const pitchId = searchParams.get("pitchId") || null;

    // Validate parameters
    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
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

    // Fetch offers by this investor for the pitch
    const investorOffers = await db
      .select({
        id: offers.id,
        pitchId: offers.pitchId,
        investorId: offers.offerBy, // Maps to offerBy in schema
        offerDescription: offers.offerDescription,
        offeredAt: offers.offeredAt,
        offerStatus: offers.offerStatus,
      })
      .from(offers)
      .where(and(eq(offers.pitchId, pitchId)));

    return NextResponse.json(investorOffers, { status: 200 });
  } catch (error) {
    console.error("Error fetching investor offers:", error);
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
      })
      .from(pitch)
      .where(and(eq(pitch.id, pitchId), eq(pitch.scoutId, scoutId)))
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
