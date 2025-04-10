import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database"; // Adjust this import path according to your setup
import {
  scouts,
  faqs,
  scoutUpdates,
  daftarScouts,
  scoutApproved,
} from "@/backend/drizzle/models/scouts"; // Adjust path as needed
import { daftar } from "@/backend/drizzle/models/daftar";
import { eq, inArray } from "drizzle-orm"; // Drizzle ORM query helpers

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const scoutId = url.searchParams.get("scoutId");

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
    }

    // Fetch scout data
    const scoutData = await db
      .select({
        targetAudAgeStart: scouts.targetAudAgeStart,
        targetAudAgeEnd: scouts.targetAudAgeEnd,
        scoutCommunity: scouts.scoutCommunity,
        targetAudLocation: scouts.targetAudLocation,
        scoutStage: scouts.scoutStage,
        scoutSector: scouts.scoutSector,
        lastDayToPitch: scouts.lastDayToPitch, // Last day to pitch
      })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (scoutData.length === 0) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    const scout = scoutData[0];

    // Fetch related FAQs
    const faqData = await db
      .select({
        faqQuestion: faqs.faqQuestion,
        faqAnswer: faqs.faqAnswer,
      })
      .from(faqs)
      .where(eq(faqs.scoutId, scoutId));

    // Fetch related updates
    const updateData = await db
      .select({
        updateInfo: scoutUpdates.updateInfo,
        updateDate: scoutUpdates.updateDate,
      })
      .from(scoutUpdates)
      .where(eq(scoutUpdates.scoutId, scoutId));

    // Fetch daftar names and related data from daftarScouts (without needing to query daftar table directly)
    const daftarNamesData = await db
      .select({
        name: daftar.name,
        structure: daftar.structure,
        website: daftar.website,
        location: daftar.location,
        onDaftarSince: daftar.createdAt,
        bigPicture: daftar.bigPicture,
        image: daftar.profileUrl,
      })
      .from(daftarScouts)
      .leftJoin(daftar, eq(daftar.id, daftarScouts.daftarId))
      .where(eq(daftarScouts.scoutId, scoutId));

    // Construct the response
    return NextResponse.json({
      scout,
      faqs: faqData,
      updates: updateData,
      collaboration: daftarNamesData,
      lastDayToPitch: scout.lastDayToPitch,
    });
  } catch (error) {
    console.error("Error fetching scout data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
