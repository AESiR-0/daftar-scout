import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const scoutId = url.searchParams.get("scoutId");
  if (!scoutId) {
    return NextResponse.json({ message: "Missing scoutId" }, { status: 400 });
  }
  try {
    const scoutStatus = await db
      .select({ name: scouts.scoutName, status: scouts.status })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId));
    const { name, status } = scoutStatus[0];
    return NextResponse.json({ name, status }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: "Scout not found : ", e },
      { status: 500 }
    );
  }
}
