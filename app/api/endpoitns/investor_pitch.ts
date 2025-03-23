import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { investorPitch } from "@/backend/drizzle/models/pitch";

export async function GET() {
    const allFeedback = await db.select().from(investorPitch);
    return NextResponse.json(allFeedback);
}
