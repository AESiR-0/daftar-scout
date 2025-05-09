import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
    daftar,
    daftarInvestors,
} from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";

interface TeamMemberResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    designation: string;
    status: string;
    joinDate: string;
    isCurrentUser: boolean;
}

interface AddTeamMemberRequest {
    email: string;
    designation: string;
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

    // Get user ID and verify access
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

    // Get all team members
    const teamMembers = await db
        .select({
            id: users.id,
            firstName: users.name,
            lastName: users.lastName,
            email: users.email,
            designation: daftarInvestors.designation,
            status: daftarInvestors.status,
            joinDate: daftarInvestors.joinDate,
        })
        .from(daftarInvestors)
        .innerJoin(users, eq(users.id, daftarInvestors.investorId))
        .where(eq(daftarInvestors.daftarId, daftarId));
    // Transform response to include isCurrentUser flag
    const response: TeamMemberResponse[] = teamMembers.map(member => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName || '',
        email: member.email,
        designation: member.designation || '',
        status: member.status || '',
        isCurrentUser: member.id === userId,
        joinDate: member.joinDate?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session || !session?.user || !session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url)
    const daftarId = searchParams.get("daftarId")
    if (!daftarId)
        return NextResponse.json({ error: "Daftar ID not given" }, { status: 404 })

    // Get user ID and verify access
    const user = await db.select({ userId: users.id, name: users.name, lastName: users.lastName }).from(users).where(eq(users.email, session.user.email))
    if (user.length == 0)
        return NextResponse.json({ error: "User does not exist" }, { status: 500 })
    const { userId, name: currentUserName, lastName: currentUserLastName } = user[0]

    // Verify user has access to this Daftar
    const daftarInvestor = await db
        .select({
            daftarId: daftarInvestors.daftarId,
            designation: daftarInvestors.designation
        })
        .from(daftarInvestors)
        .where(and(
            eq(daftarInvestors.daftarId, daftarId),
            eq(daftarInvestors.investorId, userId)
        ))
        .limit(1);

    if (daftarInvestor.length === 0) {
        return NextResponse.json({ error: "Daftar not found or unauthorized" }, { status: 404 });
    }

    const currentUserDesignation = daftarInvestor[0].designation;

    try {
        const { email, designation }: AddTeamMemberRequest = await req.json()

        // Find user by email
        const newMember = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (newMember.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is already a team member
        const existingMember = await db
            .select()
            .from(daftarInvestors)
            .where(and(
                eq(daftarInvestors.daftarId, daftarId),
                eq(daftarInvestors.investorId, newMember[0].id)
            ))
            .limit(1);

        if (existingMember.length > 0) {
            return NextResponse.json({ error: "User is already a team member" }, { status: 400 });
        }

        // Get Daftar details
        const daftarDetails = await db
            .select({
                name: daftar.name
            })
            .from(daftar)
            .where(eq(daftar.id, daftarId))
            .limit(1);

        if (daftarDetails.length === 0) {
            return NextResponse.json({ error: "Daftar not found" }, { status: 404 });
        }

        // Add new team member
        await db.insert(daftarInvestors).values({
            daftarId,
            investorId: newMember[0].id,
            designation,
            status: 'pending',
            joinType: 'invite',
        });

        // Get all existing team members
        const teamMembers = await db
            .select({
                id: users.id
            })
            .from(daftarInvestors)
            .innerJoin(users, eq(users.id, daftarInvestors.investorId))
            .where(and(
                eq(daftarInvestors.daftarId, daftarId),
                eq(daftarInvestors.status, 'active')
            ));

        // Notify the invited user
        await createNotification({
            type: "updates",
            subtype: "daftar_invite_received",
            title: "Daftar Team Invitation",
            description: `You've been invited to join ${daftarDetails[0].name} as ${designation}`,
            role: "investor",
            targeted_users: [newMember[0].id],
            payload: {
                action: "daftar_invite_received",
                daftar_id: daftarId,
                action_by: userId,
                action_at: new Date().toISOString(),
                message: `You've been invited to join ${daftarDetails[0].name} as ${designation}`,
                designation: designation,
                daftarName: daftarDetails[0].name,
                currentUsername: `${currentUserName} ${currentUserLastName}`.trim(),
                invitedUsername: `${newMember[0].name} ${newMember[0].lastName || ''}`.trim(),
                invitedUserDesignation: designation
            }
        });

        // Notify existing team members
        await createNotification({
            type: "updates",
            subtype: "daftar_member_invited",
            title: "New Team Member Invited",
            description: `${currentUserName} ${currentUserLastName} invited ${newMember[0].name} ${newMember[0].lastName || ''} as ${designation}`,
            role: "investor",
            targeted_users: teamMembers.map(member => member.id),
            payload: {
                action: "daftar_member_invited",
                daftar_id: daftarId,
                action_by: userId,
                action_at: new Date().toISOString(),
                message: `${currentUserName} ${currentUserLastName} invited ${newMember[0].name} ${newMember[0].lastName || ''} as ${designation}`,
                designation: designation,
                daftarName: daftarDetails[0].name,
                currentUsername: `${currentUserName} ${currentUserLastName}`.trim(),
                invitedUsername: `${newMember[0].name} ${newMember[0].lastName || ''}`.trim(),
                invitedUserDesignation: designation
            }
        });

        return NextResponse.json({ message: "Team member invited successfully" });
    } catch (error) {
        console.error("Error adding team member:", error);
        return NextResponse.json({ error: "Failed to add team member" }, { status: 500 });
    }
} 