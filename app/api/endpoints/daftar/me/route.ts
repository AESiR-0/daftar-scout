import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
    daftar,
    daftarInvestors,
    daftarStructure,
} from "@/backend/drizzle/models/daftar";
import { structure } from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";
import { auth } from "@/auth";
import { eq, inArray, and } from "drizzle-orm";



export async function GET(req: NextRequest) {

    const session = await auth()
    if (!session || !session?.user || !session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url)
    const daftarId = searchParams.get("daftarId")
    if (!daftarId)
        return NextResponse.json({ error: "Daftar ID not given" }, { status: 404 })
    const user = await db.select({ userId: users.id }).from(users).where(eq(users.email, session.user.email))
    if (user.length == 0)
        return NextResponse.json({ error: "User does not exist" }, { status: 500 })
    const { userId } = user[0]
    const daftarInvestor = await db
        .select()
        .from(daftarInvestors)
        .where(and(
            eq(daftarInvestors.daftarId, daftarId),
            eq(daftarInvestors.investorId, userId)
        ))
        .limit(1);

    if (daftarInvestor.length === 0) {
        return NextResponse.json({ error: "Daftar not found or unauthorized" }, { status: 404 });
    }

    const daftarDetails = await db
        .select()
        .from(daftar)
        .where(eq(daftar.id, daftarId))
        .limit(1);

    if (daftarDetails.length === 0) {
        return NextResponse.json({ error: "Daftar details not found" }, { status: 404 });
    }

    return NextResponse.json(daftarDetails[0], { status: 200 });

}