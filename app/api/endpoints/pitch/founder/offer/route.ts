import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { offers, offerActions } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest
) {
  try {
    const body = await req.json();
    const { pitchId } = await body;

    // Validate path parameter
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitch_id is required" },
        { status: 400 }
      );
    }

    // Fetch offers for the pitch
    const pitchOffers = await db
      .select({
        id: offers.id,
        pitch_id: offers.pitchId,
        investor_id: offers.offerBy,
        offer_desc: offers.offerDescription,
        status: offers.offerStatus,
        offer_sent_at: offers.offeredAt,
        created_at: offers.offeredAt,
      })
      .from(offers)
      .where(eq(offers.pitchId, pitchId));

    return NextResponse.json(pitchOffers, { status: 200 });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    const postBody = await req.json();
    const { pitchId } = postBody;

    // Validate path parameter
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitch_id is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { offerId, action, notes, actionTakenBy } = body;

    // Manual validation
    if (!offerId || !Number.isInteger(offerId) || offerId < 1) {
      return NextResponse.json(
        { error: "offerId is required and must be a positive integer" },
        { status: 400 }
      );
    }
    if (!action || (action !== "accepted" && action !== "rejected")) {
      return NextResponse.json(
        { error: "action is required and must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }
    if (!actionTakenBy) {
      return NextResponse.json(
        { error: "actionTakenBy is required" },
        { status: 400 }
      );
    }

    // Verify the offer belongs to this pitch
    const offerCheck = await db
      .select()
      .from(offers)
      .where(and(eq(offers.id, offerId), eq(offers.pitchId, pitchId)))
      .limit(1);

    if (offerCheck.length === 0) {
      return NextResponse.json(
        { error: "Offer not found or not associated with this pitch" },
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
          actionTakenBy,
          actionTakenAt: new Date(),
        })
        .where(eq(offerActions.offerId, offerId));
    } else {
      // Insert new action
      await db.insert(offerActions).values({
        offerId,
        isActionTaken: true,
        action,
        actionTakenBy,
        actionTakenAt: new Date(),
      });
    }

    // Update offer status in offers table
    await db
      .update(offers)
      .set({
        offerStatus: action,
        offerDescription: notes
          ? `${offerCheck[0].offerDescription} | Notes: ${notes}`
          : offerCheck[0].offerDescription,
      })
      .where(eq(offers.id, offerId));

    return NextResponse.json(
      { status: "success", message: "Offer action taken successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing offer action:", error);
    return NextResponse.json({ error: "Failed to process offer action" }, { status: 500 });
  }
}