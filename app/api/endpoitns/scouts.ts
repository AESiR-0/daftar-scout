import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";

export async function GET() {
  const allScouts = await db.select().from(scouts);
  return NextResponse.json(allScouts);
}
