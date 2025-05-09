import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daftarId = searchParams.get("daftarId");
    if (!daftarId) {
        return NextResponse.json({ error: "Daftar ID not provided" }, { status: 400 });
    }

    // Get current user
    const user = await db
        .select({ 
            id: users.id,
            name: users.name,
            lastName: users.lastName
        })
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);

    if (user.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user[0].id;

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
        return NextResponse.json({ error: "Unauthorized access to Daftar" }, { status: 403 });
    }

    try {
        // Update current user's approval status
        await db
            .update(daftarInvestors)
            .set({
                approvesDelete: true
            })
            .where(and(
                eq(daftarInvestors.daftarId, daftarId),
                eq(daftarInvestors.investorId, userId)
            ));

        // Get all team members and check if everyone has approved
        const teamMembers = await db
            .select({
                id: users.id,
                name: users.name,
                lastName: users.lastName,
                approvesDelete: daftarInvestors.approvesDelete
            })
            .from(daftarInvestors)
            .innerJoin(users, eq(users.id, daftarInvestors.investorId))
            .where(eq(daftarInvestors.daftarId, daftarId));

        const allApproved = teamMembers.every(member => member.approvesDelete);

        // Get Daftar details for notification
        const daftarDetails = await db
            .select({
                name: daftar.name
            })
            .from(daftar)
            .where(eq(daftar.id, daftarId))
            .limit(1);

        if (allApproved) {
            // Archive the Daftar by setting deletedOn
            await db
                .update(daftar)
                .set({
                    deletedOn: new Date()
                })
                .where(eq(daftar.id, daftarId));

            // Notify all team members about the archival
            await createNotification({
                type: "updates",
                subtype: "daftar_archived",
                title: "Daftar Archived",
                description: `${daftarDetails[0].name} has been archived as all team members approved the deletion`,
                role: "investor",
                targeted_users: teamMembers.map(member => member.id),
                payload: {
                    action: "daftar_archived",
                    daftar_id: daftarId,
                    action_by: userId,
                    action_at: new Date().toISOString(),
                    message: `${daftarDetails[0].name} has been archived as all team members approved the deletion`,
                    daftarName: daftarDetails[0].name
                }
            });
        } else {
            // Notify other team members about the approval
            const otherMembers = teamMembers.filter(member => member.id !== userId);
            if (otherMembers.length > 0) {
                await createNotification({
                    type: "updates",
                    subtype: "daftar_delete_approved",
                    title: "Delete Approval Update",
                    description: `${user[0].name} ${user[0].lastName} has approved the deletion of ${daftarDetails[0].name}`,
                    role: "investor",
                    targeted_users: otherMembers.map(member => member.id),
                    payload: {
                        action: "daftar_delete_approved",
                        daftar_id: daftarId,
                        action_by: userId,
                        action_at: new Date().toISOString(),
                        message: `${user[0].name} ${user[0].lastName} has approved the deletion of ${daftarDetails[0].name}`,
                        daftarName: daftarDetails[0].name
                    }
                });
            }
        }

        return NextResponse.json({
            message: allApproved ? "Daftar archived successfully" : "Delete approval recorded",
            status: allApproved ? "archived" : "pending"
        });

    } catch (error) {
        console.error("Error in Daftar deletion process:", error);
        return NextResponse.json({ error: "Failed to process deletion request" }, { status: 500 });
    }
} 