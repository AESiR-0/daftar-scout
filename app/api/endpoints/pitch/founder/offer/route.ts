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
import { users } from "@/backend/drizzle/models/users";
import { eq, and, inArray } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");

    // Fetch offers for the pitch
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }

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
    const userId = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, user.email));
    if (!userId.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const actionTakenBy = userId[0].id;
    const body = await req.json();
    const { offerId, action, notes, pitchId } = body;

    // Validate path parameter
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitch_id is required" },
        { status: 400 }
      );
    }

    // Parse request body

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

    if (action === "accepted" || action === "Accepted") {
      const userInPitch = await db
        .select({ id: pitchTeam.userId })
        .from(pitchTeam)
        .where(eq(pitchTeam.pitchId, pitchId));

      const userIds = userInPitch
        .map((user) => user.id)
        .filter((id) => id !== null);
      const userNameAge = await db
        .select({ name: users.name, lastName: users.lastName, age: users.dob })
        .from(users)
        .where(inArray(users.id, userIds));
      const userNameAgeArray = userNameAge.map((user) => {
        const age = user.age ? parseInt(user.age, 10) : 0;
        return `${user.name} ${user.lastName} (${age} yrs)`;
      });
      const pitchDetails = await db
        .select({ location: pitch.location, stage: pitch.stage })
        .from(pitch)
        .where(eq(pitch.id, pitchId));
      if (pitchDetails.length === 0) {
        return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
      }
      await createNotification({
        type: "news",
        title: ` Congratulations to ${userNameAgeArray} from ${pitchDetails[0].location}.`,
        description: `Their pitch is now backed by Daftar, disrupting the [Sector] at the ${pitchDetails[0].stage}. Team Daftar OS is excited to see the incredible value they'll bring to their stakeholders.`,
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
    if (action === "accepted" || action === "Accepted") {
      const userInPitch = await db
        .select({ id: pitchTeam.userId })
        .from(pitchTeam)
        .where(eq(pitchTeam.pitchId, pitchId));

      const userIds = userInPitch
        .map((user) => user.id)
        .filter((id) => id !== null);
      const userNameAge = await db
        .select({ name: users.name, lastName: users.lastName, age: users.dob })
        .from(users)
        .where(inArray(users.id, userIds));
      const userNameAgeArray = userNameAge.map((user) => {
        const age = user.age ? parseInt(user.age, 10) : 0;
        return `${user.name} ${user.lastName} (${age} yrs)`;
      });
      const pitchDetails = await db
        .select({ location: pitch.location, stage: pitch.stage })
        .from(pitch)
        .where(eq(pitch.id, pitchId));

      const sectorList = await db
        .select({ sectorName: focusSectors.sectorName })
        .from(pitchFocusSectors)
        .innerJoin(
          focusSectors,
          eq(pitchFocusSectors.focusSectorId, focusSectors.id)
        )
        .where(eq(pitchFocusSectors.pitchId, pitchId));

      await createNotification({
        type: "news",
        title: ` Congratulations to ${userNameAgeArray} from ${pitchDetails[0].location}.`,
        description: `Their pitch is now backed by Daftar, disrupting the ${sectorList
          .map((sector) => sector.sectorName)
          .join(", ")} sector(s) at the ${
          pitchDetails[0].stage
        }. Team Daftar OS is excited to see the incredible value they'll bring to their stakeholders.`,
      });
    }
    return NextResponse.json(
      { status: "success", message: "Offer action taken successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing offer action:", error);
    return NextResponse.json(
      { error: "Failed to process offer action" },
      { status: 500 }
    );
  }
}
