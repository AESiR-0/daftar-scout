import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { offers } from "@/backend/drizzle/models/pitch";

export async function GET() {
    const allOffers = await db.select().from(offers);
    return NextResponse.json(allOffers);
}
