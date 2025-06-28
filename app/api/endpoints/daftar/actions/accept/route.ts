import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { daftarInvestors, daftar } from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";
import { eq, and, isNotNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('mail');

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get user ID from email
    const [user] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all pending daftar invites for this user
    const pendingInvites = await db
      .select({
        daftarId: daftarInvestors.daftarId,
        designation: daftarInvestors.designation,
      })
      .from(daftarInvestors)
      .where(and(
        eq(daftarInvestors.investorId, user.id),
        isNotNull(daftarInvestors.daftarId)
      ));

    // Update the status to active for all pending invites for this user
    await db
      .update(daftarInvestors)
      .set({ status: "active" })
      .where(eq(daftarInvestors.investorId, user.id));

    // Send email notifications to daftar team members about the acceptance
    for (const invite of pendingInvites) {
      if (!invite.daftarId) continue;
      
      try {
        // Get daftar details
        const [daftarDetails] = await db
          .select({ name: daftar.name })
          .from(daftar)
          .where(eq(daftar.id, invite.daftarId))
          .limit(1);

        if (!daftarDetails) {
          console.error(`Daftar not found for ID ${invite.daftarId}`);
          continue;
        }

        // Get all active team members of this daftar
        const teamMembers = await db
          .select({ investorId: daftarInvestors.investorId })
          .from(daftarInvestors)
          .where(and(
            eq(daftarInvestors.daftarId, invite.daftarId),
            eq(daftarInvestors.status, 'active'),
            isNotNull(daftarInvestors.investorId)
          ));

        // Send email to each team member
        for (const teamMember of teamMembers) {
          if (!teamMember.investorId || teamMember.investorId === user.id) continue; // Skip the user who just accepted

          const [teamMemberUser] = await db
            .select({ email: users.email, name: users.name })
            .from(users)
            .where(eq(users.id, teamMember.investorId))
            .limit(1);

          if (!teamMemberUser?.email) {
            console.error(`No email found for team member ${teamMember.investorId}`);
            continue;
          }

          // Send daftar team response email
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'daftar_team_response',
              userEmail: teamMemberUser.email,
              userName: teamMemberUser.name || 'User',
              daftarName: daftarDetails.name,
              responderName: user.name || 'User',
              action: 'accepted',
              designation: invite.designation,
            }),
          });

          if (!emailResponse.ok) {
            console.error(`Failed to send email to team member ${teamMember.investorId}`);
          }
        }
      } catch (error) {
        console.error(`Error sending email for daftar ${invite.daftarId}:`, error);
      }
    }

    // Redirect to daftar page after successful action
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/investor/`);
  } catch (error) {
    console.error("Error accepting daftar invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept daftar invitation" },
      { status: 500 }
    );
  }
} 