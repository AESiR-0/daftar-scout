import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
  daftarScouts,
  scouts,
  scoutApproved,
  scoutQuestions,
} from "@/backend/drizzle/models/scouts";
import { eq, inArray, or, not, and, sql, isNotNull } from "drizzle-orm";
import { auth } from "@/auth"; // Assuming you have an auth utility
import { users } from "@/backend/drizzle/models/users"; // Assuming you have a users table
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar"; // Assuming you have an investordaftar table
import { createNotification } from "@/lib/notifications/insert";

const defaultQuestions = [
  {
    question: "Introduce yourself and the problem you are solving",
    videoUrl: "/videos/problem.mp4",
    isCustom: false,
  },
  {
    question: "What are you building",
    videoUrl: "/videos/market.mp4",
    isCustom: false,
  },
  {
    question: "Why do you really want to solve the problem",
    videoUrl: "/videos/solution.mp4",
    isCustom: false,
  },
  {
    question: "Who are your customers, and how are they dealing with this problem today",
    videoUrl: "/videos/customer.mp4",
    isCustom: false,
  },
  {
    question: "Why will your customers switch from competitors to your product",
    videoUrl: "/videos/business.mp4",
    isCustom: false,
  },
  {
    question: "How will you make money",
    videoUrl: "/videos/team.mp4",
    isCustom: false,
  },
  {
    question: "What is the growth here (development, traction, or revenue), and challenges you are facing",
    videoUrl: "/videos/vision.mp4",
    isCustom: false,
  },
];

async function generateScoutId(scoutName: string): Promise<string> {
  const prefix = scoutName.slice(0, 3).toLowerCase();
  let scoutId: string = "";
  let isUnique = false;

  while (!isUnique) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    scoutId = `${prefix}${randomNum}`;

    // Check if the generated scoutId already exists in the database
    const existingScout = await db
      .select()
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1)
      .execute();
    isUnique = existingScout.length === 0;
  }

  return scoutId;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current user and check role
    const userResult = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!userResult.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResult[0];

    let scoutsList = [];
    if (user.role === "founder") {
      // Show only scouts with status 'active'
      scoutsList = await db
        .select({
          id: scouts.scoutId,
          title: scouts.scoutName,
          status: scouts.status,
          scheduledDate: scouts.lastDayToPitch,
          postedby: scouts.daftarId,
        })
        .from(scouts)
        .where(
          or(
            eq(scouts.scoutId, "jas730"),
            or(eq(scouts.status, "active"), eq(scouts.status, "Active"))
          )
        );
    } else {
      // Get all daftars the user is associated with
      const userDaftars = await db
        .select({
          daftarId: daftarInvestors.daftarId,
        })
        .from(users)
        .innerJoin(
          daftarInvestors,
          eq(users.id, daftarInvestors.investorId)
        )
        .where(
          and(
            eq(users.email, session.user.email),
            eq(daftarInvestors.status, "active")  // Only get daftars where user is active
          )
        );

      if (!userDaftars.length) {
        return NextResponse.json([], { status: 200 });  // Return empty array instead of 404
      }

      // Filter out null values and create the daftar IDs array
      const userDaftarIds = userDaftars
        .map(d => d.daftarId)
        .filter((id): id is string => id !== null);

      // Get all scouts where any of user's daftars is either the owner or a collaborator
      scoutsList = await db
        .select({
          id: scouts.scoutId,
          title: scouts.scoutName,
          status: scouts.status,
          scheduledDate: scouts.lastDayToPitch,
          postedby: scouts.daftarId,
        })
        .from(scouts)
        .where(
          and(
            or(
              eq(scouts.scoutId, "jas730"),
              or(
                inArray(scouts.daftarId, userDaftarIds),
                sql`${scouts.scoutId} IN (
                  SELECT ${daftarScouts.scoutId}
                  FROM ${daftarScouts}
                  WHERE ${inArray(daftarScouts.daftarId, userDaftarIds)}
                )`
              )
            ),
            not(eq(scouts.status, "deleted")),  // Don't show deleted scouts
            not(eq(scouts.deleteIsAgreedByAll, true))  // Only show active scouts
          )
        );
    }

    // Get owner daftar names
    const ownerDaftars = await db
      .select({
        id: daftar.id,
        name: daftar.name,
      })
      .from(daftar)
      .where(
        inArray(
          daftar.id,
          scoutsList.map(s => s.postedby).filter((id): id is string => id !== null)
        )
      );

    // Get collaborator daftars
    const collaborators = await db
      .select({
        scoutId: daftarScouts.scoutId,
        daftarName: daftar.name,
      })
      .from(daftarScouts)
      .innerJoin(
        daftar,
        eq(daftarScouts.daftarId, daftar.id)
      )
      .where(
        inArray(
          daftarScouts.scoutId,
          scoutsList.map((s) => s.id).filter((id): id is string => id !== null)
        )
      );

    // Format the response to match the frontend's expected structure
    const formattedScouts = scoutsList.map((scout) => {
      const ownerDaftar = ownerDaftars.find(d => d.id === scout.postedby);
      const scoutCollaborators = collaborators
        .filter(c => c.scoutId === scout.id)
        .map(c => c.daftarName);
    
      
      return {
        id: scout.id,
        title: scout.title,
        status: (scout.status || 'planning').toLowerCase(),
        scheduledDate: scout.scheduledDate,
        postedby: ownerDaftar?.name || scout.postedby,
        collaborator: scoutCollaborators
      };
    });

    return NextResponse.json(formattedScouts);
  } catch (error) {
    console.error("Error in scouts GET endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { scoutName, daftarId } = body;

    // Get current user
    const currentUser = await db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const scoutId = await generateScoutId(scoutName);

    // Insert the new scout
    const newScout = await db
      .insert(scouts)
      .values({
        scoutId,
        scoutName,
        status: "planning",
        daftarId: daftarId,
      })
      .returning();

    // Link scout to daftar
    await db.insert(daftarScouts).values({
      scoutId,
      daftarId,
      isPending: false,
    });

    // Fetch all investors for the given daftarId
    const daftarMembers = await db
      .select({
        investorId: daftarInvestors.investorId,
      })
      .from(daftarInvestors)
      .where(
        and(
          eq(daftarInvestors.daftarId, daftarId),
          eq(daftarInvestors.status, "active"),
          isNotNull(daftarInvestors.investorId)
        )
      );

    // Get daftar details
    const daftarDetails = await db
      .select({
        id: daftar.id,
        name: daftar.name,
      })
      .from(daftar)
      .where(eq(daftar.id, daftarId))
      .limit(1);

    // Insert all members into scoutApproved
    if (daftarMembers.length > 0) {
      const approvedInserts = daftarMembers.map((member) => ({
        scoutId,
        investorId: member.investorId,
        isApproved: null,
        approvedAt: null,
      }));

      await db.insert(scoutApproved).values(approvedInserts);

      // Send notification to all active daftar members
      const validDaftarIds = daftarMembers
        .map(m => m.investorId)
        .filter((id): id is string => id !== null);

      if (validDaftarIds.length > 0) {
        await createNotification({
          type: "scout_link",
          subtype: "scout_created",
          title: "New Scout Created",
          description: `A new scout "${scoutName}" has been created`,
          role: "investor",
          targeted_users: validDaftarIds,
          payload: {
            scout_id: scoutId,
            message: `${currentUser[0].name} has created a new scout "${scoutName}"`
          }
        });
      }
    }

    // Insert default questions for English language
    const questionsToInsert = defaultQuestions.map(q => ({
      scoutId,
      language: "English",
      scoutQuestion: q.question,
      isCustom: false,
      scoutAnswerSampleUrl: q.videoUrl
    }));

    await db.insert(scoutQuestions).values(questionsToInsert);

    return NextResponse.json(
      { message: "Scout created successfully", data: newScout[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating scout:", error);
    return NextResponse.json(
      { message: "Error creating scout", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");

    if (!scoutId) {
      return NextResponse.json(
        { error: "Scout ID is required" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get scout details before deletion
    const scout = await db
      .select({
        scoutName: scouts.scoutName,
        daftarId: scouts.daftarId,
      })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (!scout.length) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    // Get all active members of the daftar
    const daftarMembers = await db
      .select({
        investorId: daftarInvestors.investorId,
      })
      .from(daftarInvestors)
      .where(
        and(
          eq(daftarInvestors.daftarId, scout[0].daftarId || ""),
          eq(daftarInvestors.status, "active"),
          isNotNull(daftarInvestors.investorId)
        )
      );

    // Delete the scout
    await db
      .update(scouts)
      .set({ 
        status: "deleted",
        deletedOn: new Date(),
      })
      .where(eq(scouts.scoutId, scoutId));

    // Notify all active daftar members
    const validDaftarIds = daftarMembers
      .map(m => m.investorId)
      .filter((id): id is string => id !== null);

    if (validDaftarIds.length > 0) {
      await createNotification({
        type: "alert",
        subtype: "scout_deleted",
        title: "Scout Deleted",
        description: `Scout "${scout[0].scoutName}" has been deleted`,
        role: "investor",
        targeted_users: validDaftarIds,
        payload: {
          scout_id: scoutId,
          message: `${currentUser[0].name} has deleted the scout "${scout[0].scoutName}"`
        }
      });
    }

    return NextResponse.json(
      { message: "Scout deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting scout:", error);
    return NextResponse.json(
      { message: "Error deleting scout", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { scoutId, status } = body;

    if (!scoutId || !status) {
      return NextResponse.json(
        { error: "Scout ID and status are required" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get scout details
    const scout = await db
      .select({
        scoutName: scouts.scoutName,
        daftarId: scouts.daftarId,
      })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (!scout.length) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    // Get all active members of the daftar
    const daftarMembers = await db
      .select({
        investorId: daftarInvestors.investorId,
      })
      .from(daftarInvestors)
      .where(
        and(
          isNotNull(daftarInvestors.investorId),
          eq(daftarInvestors.status, "active"),
          eq(daftarInvestors.daftarId, scout[0].daftarId || "")
        )
      );

    // Update scout status
    await db
      .update(scouts)
      .set({ 
        status: status,
      })
      .where(eq(scouts.scoutId, scoutId));

    // Get daftar details
    const daftarDetails = await db
      .select({
        id: daftar.id,
        name: daftar.name,
      })
      .from(daftar)
      .where(eq(daftar.id, scout[0].daftarId || ""))
      .limit(1);

    // Send notification to all active daftar members
    const validDaftarIds = daftarMembers
      .map(m => m.investorId)
      .filter((id): id is string => id !== null);

    if (validDaftarIds.length > 0) {
      const notificationType = status === "closed" ? "updates" : "scout_link";
      const notificationSubtype = status === "closed" ? "scouting_closed" : "scouting_started";
      const notificationTitle = status === "closed" ? "Scouting Closed" : "Scouting Started";

      await createNotification({
        type: notificationType,
        subtype: notificationSubtype,
        title: notificationTitle,
        description: `Scouting for "${scout[0].scoutName}" has been ${status}`,
        role: "investor",
        targeted_users: validDaftarIds,
        payload: {
          scout_id: scoutId,
          message: `${currentUser[0].name} has ${status} the scouting for "${scout[0].scoutName}"`
        }
      });
    }

    return NextResponse.json(
      { message: "Scout status updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating scout status:", error);
    return NextResponse.json(
      { message: "Error updating scout status", error: error.message },
      { status: 500 }
    );
  }
}