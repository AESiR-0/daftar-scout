import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID not provided" }, { status: 400 });
        }

        // Find active daftar association for the user
        const daftarInvestor = await db
            .select({
                daftarId: daftarInvestors.daftarId,
            })
            .from(daftarInvestors)
            .where(and(
                eq(daftarInvestors.investorId, userId),
                eq(daftarInvestors.status, "active")
            ))
            .limit(1);

        if (daftarInvestor.length === 0) {
            return NextResponse.json({ 
                daftarId: null,
                daftarName: null
            });
        }

        // Get daftar details
        const daftarDetails = await db
            .select({
                id: daftar.id,
                name: daftar.name,
            })
            .from(daftar)
            .where(eq(daftar.id, daftarInvestor[0].daftarId))
            .limit(1);

        if (daftarDetails.length === 0) {
            return NextResponse.json({ 
                daftarId: null,
                daftarName: null
            });
        }

        return NextResponse.json({
            daftarId: daftarDetails[0].id,
            daftarName: daftarDetails[0].name
        });
    } catch (error) {
        console.error("Error fetching daftar by user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 