import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch";
import { scouts } from "@/backend/drizzle/models/scouts";
import { daftar } from "@/backend/drizzle/models/daftar";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    const pitchId = searchParams.get("pitchId");
    const daftarId = searchParams.get("daftarId");

    const details: {
      pitchName?: string;
      scoutName?: string;
      daftarName?: string;
    } = {};

    // Fetch pitch details if pitchId is provided
    if (pitchId) {
      const pitchDetails = await db
        .select({ pitchName: pitch.pitchName })
        .from(pitch)
        .where(eq(pitch.id, pitchId))
        .limit(1);

      if (pitchDetails.length > 0) {
        details.pitchName = pitchDetails[0].pitchName;
      }
    }

    // Fetch scout details if scoutId is provided
    if (scoutId) {
      const scoutDetails = await db
        .select({ scoutName: scouts.scoutName })
        .from(scouts)
        .where(eq(scouts.scoutId, scoutId))
        .limit(1);

      if (scoutDetails.length > 0) {
        details.scoutName = scoutDetails[0].scoutName;
      }
    }

    // Fetch daftar details if daftarId is provided
    if (daftarId) {
      const daftarDetails = await db
        .select({ daftarName: daftar.name })
        .from(daftar)
        .where(eq(daftar.id, daftarId))
        .limit(1);

      if (daftarDetails.length > 0) {
        details.daftarName = daftarDetails[0].daftarName;
      }
    }

    return NextResponse.json(details, { status: 200 });
  } catch (error) {
    console.error("Error fetching notification details:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification details" },
      { status: 500 }
    );
  }
} 