import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { sql, and, eq } from "drizzle-orm";
import { investorPitch, pitch } from "@/backend/drizzle/models/pitch";
import { users } from "@/backend/drizzle/models/users";
import { daftarInvestors, daftar } from "@/backend/drizzle/models/daftar";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email)
    return NextResponse.json({ message: "Unauthorized", status: 401 });

  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");

  if (!scoutId) {
    return NextResponse.json({ message: "Invalid parameters", status: 400 });
  }

  // Step 1: Get all pitches for the scout
  const pitches = await db
    .select({
      pitchId: pitch.id,
      pitchName: pitch.pitchName,
      status: pitch.investorStatus,
    })
    .from(pitch)
    .where(eq(pitch.scoutId, scoutId));

  if (pitches.length === 0) {
    return NextResponse.json({ data: [], status: 200 });
  }

  // Step 2: For each pitch, get interested investors and averageBelieveRating
  const result = await Promise.all(
    pitches.map(async ({ pitchId, pitchName, status }) => {
      const interestedInvestors = await db
        .select({
          userId: users.id,
          firstName: users.name,
          lastName: users.lastName,
          email: users.email,
          image: users.image,
          believeRating: investorPitch.believeRating,
          designation: daftarInvestors.designation,
          daftarId: daftarInvestors.daftarId,
          daftarName: daftar.name,
        })
        .from(investorPitch)
        .innerJoin(users, eq(users.id, investorPitch.investorId))
        .innerJoin(daftarInvestors, eq(users.id, daftarInvestors.investorId))
        .innerJoin(daftar, eq(daftar.id, daftarInvestors.daftarId))
        .where(
          and(
            eq(investorPitch.pitchId, pitchId),
            eq(investorPitch.scoutId, scoutId),
            eq(investorPitch.shouldMeet, true)
          )
        );

      const averageResult = await db
        .select({
          avg: sql<number>`AVG(${investorPitch.believeRating})`,
        })
        .from(investorPitch)
        .where(
          and(
            eq(investorPitch.pitchId, pitchId),
            eq(investorPitch.scoutId, scoutId)
          )
        );

      const averageBelieveRating = averageResult[0]?.avg ?? 0;

      return {
        pitchId,
        pitchName,
        status,
        interestedInvestors,
        averageBelieveRating,
      };
    })
  );

  return NextResponse.json({ data: result, status: 200 });
}
