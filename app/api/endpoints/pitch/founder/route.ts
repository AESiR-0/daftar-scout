import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { pitch } from "@/backend/drizzle/models/pitch";
import { db } from "@/backend/database";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { scoutId, pitchName } = body;

  if (!scoutId || !pitchName) {
    return NextResponse.json(
      { message: "Missing scoutId or pitchName" },
      { status: 400 }
    );
  }

  const pitchId = nanoid();

  await db.insert(pitch).values({
    id: pitchId,
    scoutId,
    pitchName,
  });

  return NextResponse.json({ pitchId });
}
