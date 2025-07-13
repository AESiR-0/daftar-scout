import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { pitchTeam, pitch, pitchDelete } from "@/backend/drizzle/models/pitch";
import { scouts, daftarScouts, scoutApproved, scoutDelete } from "@/backend/drizzle/models/scouts";
import { eq, and, isNotNull } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    // Get user details first
    const userDetails = await db
      .select({
        id: users.id,
        name: users.name,
        lastName: users.lastName,
        role: users.role,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userDetails.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userDetails[0];
    const userId = user.id;

    // Start transaction for cleanup
    await db.transaction(async (tx) => {
      // 1. Handle Investor cleanup (dissociate from scouts)
      if (user.role === "investor") {
        // Get all daftars the user is part of
        const userDaftars = await tx
          .select({
            daftarId: daftarInvestors.daftarId,
            designation: daftarInvestors.designation,
          })
          .from(daftarInvestors)
          .where(eq(daftarInvestors.investorId, userId));

        // Remove user from all daftars
        await tx
          .delete(daftarInvestors)
          .where(eq(daftarInvestors.investorId, userId));

        // Clean up scout approvals and delete requests for this user
        await tx
          .delete(scoutApproved)
          .where(eq(scoutApproved.investorId, userId));

        await tx
          .delete(scoutDelete)
          .where(eq(scoutDelete.investorId, userId));

        // For each daftar, check if it's now empty and handle scout deletion
        for (const userDaftar of userDaftars) {
          if (userDaftar.daftarId) {
            // Check remaining members in daftar
            const remainingMembers = await tx
              .select({ count: daftarInvestors.id })
              .from(daftarInvestors)
              .where(eq(daftarInvestors.daftarId, userDaftar.daftarId));

            // If no members left, delete the daftar and its scouts
            if (remainingMembers.length === 0) {
              // Get all scouts associated with this daftar
              const daftarScoutsList = await tx
                .select({
                  scoutId: daftarScouts.scoutId,
                })
                .from(daftarScouts)
                .where(eq(daftarScouts.daftarId, userDaftar.daftarId));

              // Delete all scouts and their associated pitches
              for (const scout of daftarScoutsList) {
                if (!scout.scoutId) continue; // Skip if scoutId is null
                
                // Get all pitches for this scout
                const scoutPitches = await tx
                  .select({
                    id: pitch.id,
                    pitchName: pitch.pitchName,
                  })
                  .from(pitch)
                  .where(eq(pitch.scoutId, scout.scoutId));

                // Reject all pitches with reason "Scout was deleted"
                for (const pitchData of scoutPitches) {
                  await tx
                    .update(pitch)
                    .set({
                      status: "rejected",
                      investorStatus: "rejected",
                      isLocked: true,
                    })
                    .where(eq(pitch.id, pitchData.id));

                  // Notify pitch team members about rejection
                  const pitchTeamMembers = await tx
                    .select({
                      userId: pitchTeam.userId,
                    })
                    .from(pitchTeam)
                    .where(eq(pitchTeam.pitchId, pitchData.id));

                  const validTeamMembers = pitchTeamMembers
                    .map(member => member.userId)
                    .filter((id): id is string => id !== null);

                  if (validTeamMembers.length > 0) {
                    await createNotification({
                      type: "updates",
                      subtype: "pitch_rejected",
                      title: "Pitch Rejected",
                      description: `Your pitch "${pitchData.pitchName}" has been rejected because the scout was deleted.`,
                      role: "founder",
                      targeted_users: validTeamMembers,
                      payload: {
                        pitchId: pitchData.id,
                        reason: "Scout was deleted",
                        message: `Your pitch "${pitchData.pitchName}" has been rejected because the scout was deleted.`,
                      },
                    });
                  }
                }

                // Delete the scout
                await tx
                  .update(scouts)
                  .set({
                    isArchived: true,
                    status: "deleted",
                    deletedOn: new Date(),
                  })
                  .where(eq(scouts.scoutId, scout.scoutId));
              }

              // Delete daftar-scout associations
              await tx
                .delete(daftarScouts)
                .where(eq(daftarScouts.daftarId, userDaftar.daftarId));
            }
          }
        }
      }

      // 2. Handle Founder cleanup (dissociate from pitches)
      if (user.role === "founder") {
        if (!userId) return; // Skip if userId is null
        
        // Get all pitches the user is part of
        const userPitches = await tx
          .select({
            pitchId: pitchTeam.pitchId,
            designation: pitchTeam.designation,
          })
          .from(pitchTeam)
          .where(eq(pitchTeam.userId, userId));

        // Remove user from all pitch teams
        await tx
          .delete(pitchTeam)
          .where(eq(pitchTeam.userId, userId));

        // Clean up pitch delete requests for this user
        await tx
          .delete(pitchDelete)
          .where(eq(pitchDelete.founderId, userId));

        // For each pitch, check if it's now empty and handle accordingly
        for (const userPitch of userPitches) {
          if (userPitch.pitchId) {
            // Check remaining team members
            const remainingTeamMembers = await tx
              .select({ count: pitchTeam.id })
              .from(pitchTeam)
              .where(eq(pitchTeam.pitchId, userPitch.pitchId));

            // If no team members left, delete the pitch
            if (remainingTeamMembers.length === 0) {
              await tx
                .update(pitch)
                .set({
                  status: "deleted",
                  investorStatus: "deleted",
                  isLocked: true,
                })
                .where(eq(pitch.id, userPitch.pitchId));
            }
          }
        }
      }

      // 3. Finally, archive the user
      await tx
        .update(users)
        .set({
          isActive: false,
          isArchived: true,
          archivedOn: new Date(),
        })
        .where(eq(users.id, userId));
    });

    return NextResponse.json(
      {
        message: "User account archived successfully with all associations cleaned up",
        data: {
          id: user.id,
          email: user.email,
          isActive: false,
          isArchived: true,
          archivedOn: new Date(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error archiving user:", error);
    return NextResponse.json(
      { error: "Failed to archive user" },
      { status: 500 }
    );
  }
}
