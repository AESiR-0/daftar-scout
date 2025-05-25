import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { pitch } from "@/backend/drizzle/models/pitch";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const pitchId = searchParams.get("pitchId");
        const scoutId = searchParams.get("scoutId");

        if (!pitchId || !scoutId) {
            return NextResponse.json(
                { error: "Missing pitchId or scoutId" },
                { status: 400 }
            );
        }

        // Get pitch status
        const pitchDetails = await db
            .select()
            .from(pitch)
            .where(eq(pitch.id, pitchId))
            .execute();

        if (!pitchDetails.length) {
            return NextResponse.json(
                { error: "Pitch not found" },
                { status: 404 }
            );
        }

        const isLocked = pitchDetails[0].isLocked || false;

        return NextResponse.json({
            pitchId,
            scoutId,
            isLocked,
        });
    } catch (error) {
        console.error("[GET /pitch/status]", error);
        return NextResponse.json(
            { error: "Failed to get pitch status" },
            { status: 500 }
        );
    }
} 