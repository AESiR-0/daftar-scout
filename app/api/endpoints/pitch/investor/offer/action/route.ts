import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { offers, offerActions} from "@/backend/drizzle/models/pitch";
import { pitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest
) {
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
    if (notes && typeof notes !== "string") {
      return NextResponse.json(
        { error: "notes must be a string if provided" },
        { status: 400 }
      );
    }

    // Verify pitch exists and matches scoutId
    const pitchCheck = await db
      .select()
      .from(pitch)
      .where(and(eq(pitch.id, pitchId), eq(pitch.scoutId, scoutId)))
      .limit(1);

    if (pitchCheck.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found for this scoutId and pitchId" },
        { status: 404 }
      );
    }

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

    return NextResponse.json(
      { status: "success", message: "Offer action recorded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error recording offer action:", error);
    return NextResponse.json({ error: "Failed to record offer action" }, { status: 500 });
  }
}