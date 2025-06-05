import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { pitches } from "@/backend/drizzle/models/pitches";
import { daftars } from "@/backend/drizzle/models/daftars";
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
  const [pitch] = await db
    .select({ name: pitches.pitchName })
    .from(pitches)
    .where(eq(pitches.id, pitchId))
    .limit(1);
  return pitch;
});

const getDaftarDetails = cache(async (daftarId: string) => {
  const [daftar] = await db
    .select({ name: daftars.name })
    .from(daftars)
    .where(eq(daftars.id, daftarId))
    .limit(1);
  return daftar;
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