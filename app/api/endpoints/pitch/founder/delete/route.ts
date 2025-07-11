import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitchDelete, pitchTeam, pitch } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { users } from "@/backend/drizzle/models/users";
import { scouts, daftarScouts } from "@/backend/drizzle/models/scouts";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { inArray } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");

    // Validate path parameter
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitch_id is required" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await db
      .select({
        id: users.id,
        name: users.name,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, session.user.email!))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 404 }
      );
    }

    // Get team members with their user details
    const teamMembers = await db
      .select({
        id: pitchTeam.id,
        userId: pitchTeam.userId,
        designation: pitchTeam.designation,
        name: users.name,
        lastName: users.lastName,
        email: users.email,
      })
      .from(pitchTeam)
      .innerJoin(users, eq(pitchTeam.userId, users.id))
      .where(eq(pitchTeam.pitchId, pitchId));

    // Fetch deletion requests for the pitch
    const deleteRequests = await db
      .select({
        founderId: pitchDelete.founderId,
        isAgreed: pitchDelete.isAgreed,
      })
      .from(pitchDelete)
      .where(eq(pitchDelete.pitchId, pitchId));

    // Map team members with their approval status from delete requests
    const teamMembersWithApproval = teamMembers.map(member => {
      const deleteRequest = deleteRequests.find(req => req.founderId === member.userId);
      return {
        name: `${member.name} ${member.lastName || ''}`.trim(),
        email: member.email,
        userId: member.userId,
        designation: member.designation,
        isApproved: deleteRequest?.isAgreed || false,
        status: deleteRequest?.isAgreed ? "approved" : "pending"
      };
    });

    return NextResponse.json({
      currentUser: currentUser[0],
      teamMembers: teamMembersWithApproval,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pitch delete requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch delete requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const postBody = await req.json();
    const { pitchId, isAgreed } = await postBody;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const founderId = await db.select().from(users).where(eq(users.email, session.user.email!));
    if (!founderId) {
      return NextResponse.json(
        { error: "Founder not found" },
        { status: 404 }
      );
    }

    // Validate path parameter
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitch_id is required" },
        { status: 400 }
      );
    }

    if (typeof isAgreed !== "boolean") {
      return NextResponse.json(
        { error: "isAgreed must be a boolean" },
        { status: 400 }
      );
    }

    // Check if a deletion request already exists for this founder and pitch
    const existingRequest = await db
      .select()
      .from(pitchDelete)
      .where(
        and(
          eq(pitchDelete.pitchId, pitchId),
          eq(pitchDelete.founderId, founderId[0].id)
        )
      )
      .limit(1);

    if (existingRequest.length > 0) {
      // Update existing request
      await db
        .update(pitchDelete)
        .set({
          isAgreed,
        })
        .where(
          and(
            eq(pitchDelete.pitchId, pitchId),
            eq(pitchDelete.founderId, founderId[0].id)
          )
        );
    } else {
      // Insert new deletion request
      await db.insert(pitchDelete).values({
        pitchId,  
        founderId: founderId[0].id,
        isAgreed,
      });
    }

    // After updating/creating the delete request, check if all team members have approved
    const teamMembers = await db
      .select({
        userId: pitchTeam.userId,
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    const deleteRequests = await db
      .select({
        founderId: pitchDelete.founderId,
        isAgreed: pitchDelete.isAgreed,
      })
      .from(pitchDelete)
      .where(eq(pitchDelete.pitchId, pitchId));

    const allTeamMembersApproved = teamMembers.every(member => 
      deleteRequests.some(request => 
        request.founderId === member.userId && request.isAgreed
      )
    );

    if (allTeamMembersApproved) {
      // Get pitch details for notification
      const pitchDetails = await db
        .select({
          pitchName: pitch.pitchName,
          scoutId: pitch.scoutId,
        })
        .from(pitch)
        .where(eq(pitch.id, pitchId))
        .limit(1);

      if (pitchDetails.length > 0) {
        // Get scout details
        const scoutDetails = await db
          .select({
            scoutName: scouts.scoutName,
          })
          .from(scouts)
          .where(eq(scouts.scoutId, pitchDetails[0].scoutId!))
          .limit(1);

        // Get all Daftar IDs associated with the scout
        const daftarIds = await db
          .select({
            daftarId: daftarScouts.daftarId,
          })
          .from(daftarScouts)
          .where(eq(daftarScouts.scoutId, pitchDetails[0].scoutId!));

        // Filter out any null daftarIds
        const validDaftarIds = daftarIds
          .map(d => d.daftarId)
          .filter((id): id is string => id !== null);

        // Get all investors from these Daftar groups
        const investors = validDaftarIds.length > 0
          ? await db
            .select({
              investorId: daftarInvestors.investorId,
            })
            .from(daftarInvestors)
            .where(inArray(daftarInvestors.daftarId, validDaftarIds))
          : [];

        // Get pitch team members
        const pitchTeamMembers = await db
          .select({
            userId: pitchTeam.userId,
          })
          .from(pitchTeam)
          .where(eq(pitchTeam.pitchId, pitchId));

        // Combine all users, filter nulls, and remove duplicates
        const targetedUsers = [
          ...new Set([
            ...pitchTeamMembers.map((m) => m.userId),
            ...investors.map((i) => i.investorId),
          ].filter((id): id is string => id !== null)),
        ];

        // Send notification to all relevant users
        if (targetedUsers.length > 0) {
          await createNotification({
            type: "alert",
            subtype: "pitch_deleted",
            title: `Pitch "${pitchDetails[0].pitchName}" Deleted`,
            description: `Pitch "${pitchDetails[0].pitchName}" has been deleted by the founder team via ${scoutDetails[0]?.scoutName || "scout"}`,
            role: "investor",
            targeted_users: targetedUsers,
            payload: {
              action_at: new Date().toISOString(),
              pitchId,
              pitchName: pitchDetails[0].pitchName,
              scout_id: pitchDetails[0].scoutId,
              scoutName: scoutDetails[0]?.scoutName,
              message: "Pitch has been deleted by the founder team",
            },
          });
        }
      }

      // Update pitch status to deleted and lock it
      await db
        .update(pitch)
        .set({
          status: "deleted",
          investorStatus: "Deleted",
          isLocked: true,
        })
        .where(eq(pitch.id, pitchId));

      return NextResponse.json(
        {
          status: "success",
          message: "All team members have approved. Pitch has been marked as deleted.",
          isDeleted: true
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Pitch delete request processed successfully",
        isDeleted: false
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing pitch delete request:", error);
    return NextResponse.json(
      { error: "Failed to process pitch delete request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");

    // Validate path parameter
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitch_id is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { founderId } = body;

    // Manual validation
    if (!founderId) {
      return NextResponse.json(
        { error: "founderId is required" },
        { status: 400 }
      );
    }

    // Check if the deletion request exists
    const existingRequest = await db
      .select()
      .from(pitchDelete)
      .where(
        and(
          eq(pitchDelete.pitchId, pitchId),
          eq(pitchDelete.founderId, founderId)
        )
      )
      .limit(1);

    if (existingRequest.length === 0) {
      return NextResponse.json(
        { error: "Deletion request not found for this pitch and founder" },
        { status: 404 }
      );
    }

    // Delete the request
    await db
      .delete(pitchDelete)
      .where(
        and(
          eq(pitchDelete.pitchId, pitchId),
          eq(pitchDelete.founderId, founderId)
        )
      );

    return NextResponse.json(
      {
        status: "success",
        message: "Pitch delete request removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting pitch delete request:", error);
    return NextResponse.json(
      { error: "Failed to delete pitch delete request" },
      { status: 500 }
    );
  }
}
