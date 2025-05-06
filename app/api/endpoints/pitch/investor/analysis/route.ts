import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { investorPitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { users } from "@/backend/drizzle/models/users";
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    const pitchId = searchParams.get("pitchId");

    // Validate parameters
    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "scoutId and pitchId are required" },
        { status: 400 }
      );
    }

    // Fetch all analyses for this pitch with user and daftar info
    const result = await db
      .select({
        id: investorPitch.id,
        analysis: investorPitch.analysis,
        believeRating: investorPitch.believeRating,
        shouldMeet: investorPitch.shouldMeet,
        lastActionTakenOn: investorPitch.lastActionTakenOn,
        analyst: {
          id: users.id,
          name: users.name,
          role: users.role,
        },
        daftar: {
          id: daftar.id,
          name: daftar.name,
        }
      })
      .from(investorPitch)
      .leftJoin(users, eq(users.id, investorPitch.investorId))
      .leftJoin(
        daftarInvestors,
        and(
          eq(daftarInvestors.investorId, investorPitch.investorId),
          eq(daftarInvestors.status, "active")
        )
      )
      .leftJoin(daftar, eq(daftar.id, daftarInvestors.daftarId))
      .where(
        and(
          eq(investorPitch.scoutId, scoutId),
          eq(investorPitch.pitchId, pitchId)
        )
      );

    // Transform the data to match the expected format
    const analysis = result.map(entry => ({
      id: entry.id,
      analyst: {
        name: entry.analyst?.name || "N/A",
        role: entry.analyst?.role || "N/A",
        daftarName: entry.daftar?.name || "N/A"
      },
      belief: entry.shouldMeet ? "yes" : "no",
      note: entry.analysis || "",
      nps: entry.believeRating || 0,
      date: entry.lastActionTakenOn?.toISOString() || new Date().toISOString()
    }));

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error("Error fetching investor analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    const pitchId = searchParams.get("pitchId");
    const body = await req.json();
    const { analysis } = body;
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await db
      .select({ investorId: users.id })
      .from(users)
      .where(eq(users.email, session.user.email));
    const { investorId } = await user[0];

    if (!scoutId || !pitchId || !investorId) {
      return NextResponse.json(
        { error: "scoutId, pitchId, and investorId are required" },
        { status: 400 }
      );
    }
    if (typeof analysis !== "string") {
      return NextResponse.json(
        { error: "analysis must be a string" },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(investorPitch)
      .where(
        and(
          eq(investorPitch.scoutId, scoutId),
          eq(investorPitch.pitchId, pitchId),
          eq(investorPitch.investorId, investorId)
        )
      )
      .limit(1);

    if (existingRecord.length > 0) {
      // Update existing record
      await db
        .update(investorPitch)
        .set({
          analysis,
          lastActionTakenOn: new Date(),
        })
        .where(
          and(
            eq(investorPitch.scoutId, scoutId),
            eq(investorPitch.pitchId, pitchId),
            eq(investorPitch.investorId, investorId)
          )
        );
    } else {
      // Insert new record
      await db.insert(investorPitch).values({
        scoutId,
        pitchId,
        investorId,
        analysis,
        lastActionTakenOn: new Date(),
      });
    }

    return NextResponse.json(
      { status: "success", message: "Analysis saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving investor analysis:", error);
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }
}
