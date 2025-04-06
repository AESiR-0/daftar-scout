import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { investorPitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { scoutId, pitchId } = body;

    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "Missing scoutId or pitchId" },
        { status: 400 }
      );
    }

    const data = await db
      .select()
      .from(investorPitch)
      .where(
        and(
          eq(investorPitch.scoutId, scoutId),
          eq(investorPitch.pitchId, pitchId)
        )
      );

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("[GET /investor-pitch]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
