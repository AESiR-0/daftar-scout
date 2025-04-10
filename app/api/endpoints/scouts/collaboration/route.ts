// app/api/daftar-scouts/route.ts
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { daftarScouts } from "@/backend/drizzle/models/scouts";
import { daftar } from "@/backend/drizzle/models/daftar";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");
  if (!scoutId || scoutId == undefined)
    return NextResponse.json({ error: "scoutId is required" }, { status: 400 });

  const scoutEntries = await db
    .select()
    .from(daftarScouts)
    .where(eq(daftarScouts.scoutId, scoutId));

  return NextResponse.json(scoutEntries);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { scoutId, daftarId } = body;

  if (!scoutId || !daftarId) {
    return NextResponse.json(
      { error: "scoutId and daftarId are required" },
      { status: 400 }
    );
  }

  // Check if the scout exists
  const scoutExists = await db
    .select({ scoutId: scouts.scoutId })
    .from(scouts)
    .where(eq(scouts.scoutId, scoutId));

  if (scoutExists.length === 0) {
    return NextResponse.json({ error: "Invalid scoutId" }, { status: 404 });
  }

  // Check if the daftar exists
  const daftarExists = await db
    .select({ id: daftar.id })
    .from(daftar)
    .where(eq(daftar.id, daftarId));

  if (daftarExists.length === 0) {
    return NextResponse.json({ error: "Invalid daftarId" }, { status: 404 });
  }

  // Insert into daftar_scouts
  const inserted = await db.insert(daftarScouts).values({
    scoutId,
    daftarId,
    isPending: true, // You can make this dynamic if needed
  });

  return NextResponse.json({ success: true, inserted });
}
