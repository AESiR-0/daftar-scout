import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { eq, and } from "drizzle-orm";
import { scouts, daftarScouts } from "@/backend/drizzle/models/scouts";
import { daftarInvestors, daftar } from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scoutId = searchParams.get("scoutId");

    if (!scoutId) {
      return NextResponse.json(
        { error: "Scout ID is required" },
        { status: 400 }
      );
    }

    // Get all members of the scout by joining the necessary tables
    const members = await db
      .select({
        userId: daftarInvestors.investorId,
        role: daftarInvestors.designation,
        status: daftarScouts.isPending,
        daftarName: daftar.name,
        image: users.image,
      })
      .from(daftarScouts)
      .innerJoin(daftar, eq(daftarScouts.daftarId, daftar.id))
      .innerJoin(daftarInvestors, eq(daftar.id, daftarInvestors.daftarId))
      .innerJoin(users, eq(daftarInvestors.investorId, users.id))
      .where(eq(daftarScouts.scoutId, scoutId));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching scout members:", error);
    return NextResponse.json(
      { error: "Failed to fetch scout members" },
      { status: 500 }
    );
  }
} 