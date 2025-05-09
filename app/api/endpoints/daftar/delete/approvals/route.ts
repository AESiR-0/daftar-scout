import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daftarId = searchParams.get("daftarId");
    if (!daftarId) {
        return NextResponse.json({ error: "Daftar ID not provided" }, { status: 400 });
    }

    try {
        // Get all approvals for the Daftar
        const approvals = await db
            .select({
                investorId: daftarInvestors.investorId,
                approvesDelete: daftarInvestors.approvesDelete,
            })
            .from(daftarInvestors)
            .where(eq(daftarInvestors.daftarId, daftarId));

        // Transform into a map of userId -> approval date
        const approvalsMap = approvals.reduce((acc, curr) => {
            if (curr.approvesDelete) {
                acc[curr.investorId ?? ""] = curr.approvesDelete;
            }
            return acc;
        }, {} as Record<string, boolean>);

        return NextResponse.json({ approvals: approvalsMap });
    } catch (error) {
        console.error("Error fetching deletion approvals:", error);
        return NextResponse.json({ error: "Failed to fetch deletion approvals" }, { status: 500 });
    }
} 