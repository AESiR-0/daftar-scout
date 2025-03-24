import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { focusSectors } from "@/backend/drizzle/models/pitch";

export async function POST(req: Request) {
    const body = await req.json();
    const newSector = await db.insert(focusSectors).values(body).returning();
    return NextResponse.json(newSector[0]);
}
