import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { offers, pitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { scoutId: string; pitchId: string } }
) {
  try {
    const { scoutId, pitchId } = params;
    const { searchParams } = new URL(req.url);
    const investorId = searchParams.get("investorId");

    // Validate parameters
    if (!scoutId || !pitchId || !investorId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
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
      .where(
        and(
          eq(offers.pitchId, pitchId),
          eq(offers.offerBy, investorId)
        )
      );

    return NextResponse.json(investorOffers, { status: 200 });
  } catch (error) {
    console.error("Error fetching investor offers:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { scoutId: string; pitchId: string } }
) {
  try {
    const { scoutId, pitchId } = params;
    const body = await req.json();
    const { investorId, offerDescription, offerStatus } = body;

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
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}