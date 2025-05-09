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
import { createNotification } from "@/lib/notifications/insert";

interface DaftarAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

interface UpdateDaftarRequest {
    name: string;
    structure: string;
    website: string;
    vision: string;
}

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

export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session || !session?.user || !session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url)
    const daftarId = searchParams.get("daftarId")
    if (!daftarId)
        return NextResponse.json({ error: "Daftar ID not given" }, { status: 404 })

    // Get user ID
    const user = await db.select({ userId: users.id }).from(users).where(eq(users.email, session.user.email))
    if (user.length == 0)
        return NextResponse.json({ error: "User does not exist" }, { status: 500 })
    const { userId } = user[0]

    // Verify user has access to this Daftar
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

    try {
        const updateData: UpdateDaftarRequest = await req.json()

        // Update Daftar details
        await db
            .update(daftar)
            .set({
                name: updateData.name,
                structure: updateData.structure,
                website: updateData.website,
                bigPicture: updateData.vision,
            })
            .where(eq(daftar.id, daftarId));

        // Get all team members to notify them
        const teamMembers = await db
            .select({
                id: users.id,
                name: users.name,
                lastName: users.lastName,
            })
            .from(daftarInvestors)
            .innerJoin(users, eq(users.id, daftarInvestors.investorId))
            .where(eq(daftarInvestors.daftarId, daftarId));

        // Create notification for all team members
        await createNotification({
            type: "updates",
            subtype: "daftar_updated",
            title: "Daftar Details Updated",
            description: `${session.user.name || 'A team member'} has updated the Daftar details`,
            role: "investor",
            targeted_users: teamMembers.map(member => member.id),
            payload: {
                action: "daftar_updated",
                daftar_id: daftarId,
                action_by: userId,
                action_at: new Date().toISOString(),
                message: `${session.user.name || 'A team member'} has updated the Daftar details`,
                daftarName: updateData.name
            }
        });

        return NextResponse.json({ message: "Daftar updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating Daftar:", error);
        return NextResponse.json({ error: "Failed to update Daftar" }, { status: 500 });
    }
}