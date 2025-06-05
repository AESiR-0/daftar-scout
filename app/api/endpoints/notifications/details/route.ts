import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { pitch } from "@/backend/drizzle/models/pitch";
import { daftar } from "@/backend/drizzle/models/daftar";
import { eq } from "drizzle-orm";
import { cache } from 'react';

// Cache the database queries
const getScoutDetails = cache(async (scoutId: string) => {
  const [scout] = await db
    .select({ name: scouts.scoutName })
    .from(scouts)
    .where(eq(scouts.scoutId, scoutId))
    .limit(1);
  return scout;
});

const getPitchDetails = cache(async (pitchId: string) => {
  const [pitchData] = await db
    .select({ name: pitch.pitchName })
    .from(pitch)
    .where(eq(pitch.id, pitchId))
    .limit(1);
  return pitchData;
});

const getDaftarDetails = cache(async (daftarId: string) => {
  const [daftarData] = await db
      .select({ name: daftar.name })
    .from(daftar)
    .where(eq(daftar.id, daftarId))
    .limit(1);
  return daftarData;
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    const pitchId = searchParams.get("pitchId");
    const daftarId = searchParams.get("daftarId");

    if (!scoutId && !pitchId && !daftarId) {
      return NextResponse.json({ error: 'No valid ID provided' }, { status: 400 });
    }

    const [scoutDetails, pitchDetails, daftarDetails] = await Promise.all([
      scoutId ? getScoutDetails(scoutId) : null,
      pitchId ? getPitchDetails(pitchId) : null,
      daftarId ? getDaftarDetails(daftarId) : null,
    ]);

    return NextResponse.json({
      scoutName: scoutDetails?.name,
      pitchName: pitchDetails?.name,
      daftarName: daftarDetails?.name,
    });
  } catch (error) {
    console.error("Error fetching notification details:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification details" },
      { status: 500 }
    );
  }
} 