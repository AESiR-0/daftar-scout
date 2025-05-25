import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { scouts } from "@/backend/drizzle/models/scouts";
import { eq } from "drizzle-orm";
import { db } from "@/backend/database";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const scoutId = searchParams.get("scoutId");

        if (!scoutId) {
            return NextResponse.json(
                { error: "Scout ID is required" },
                { status: 400 }
            );
        }

        const scout = await db
            .select({
                scoutId: scouts.scoutId,
                status: scouts.status,
            })
            .from(scouts)
            .where(eq(scouts.scoutId, scoutId))
            .limit(1);

        if (!scout.length) {
            return NextResponse.json(
                { error: "Scout not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            scoutId: scout[0].scoutId,
            status: scout[0].status,
        });
    } catch (error) {
        console.error("Error fetching scout status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 