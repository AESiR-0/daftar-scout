import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
  daftarScouts,
  scouts,
  scoutApproved,
  scoutQuestions,
} from "@/backend/drizzle/models/scouts";
import { eq, inArray, or, not, and, sql } from "drizzle-orm";
import { auth } from "@/auth"; // Assuming you have an auth utility
import { users } from "@/backend/drizzle/models/users"; // Assuming you have a users table
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar"; // Assuming you have an investordaftar table

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
      .where(eq(users.email, session.user.email));

    if (!userDaftars.length) {
      return NextResponse.json(
        { error: "User not associated with any daftar" },
        { status: 404 }
      );
    }

    // Filter out null values and create the daftar IDs array
    const userDaftarIds = userDaftars
      .map(d => d.daftarId)
      .filter((id): id is string => id !== null);

    // Get all scouts where any of user's daftars is either the owner or a collaborator
    const scoutsList = await db
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
          inArray(scouts.daftarId, userDaftarIds),
          sql`${scouts.scoutId} IN (
            SELECT ${daftarScouts.scoutId}
            FROM ${daftarScouts}
            WHERE ${inArray(daftarScouts.daftarId, userDaftarIds)}
          )`
        )
      );

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
    const body = await req.json();
    const { scoutName, daftarId } = body;

    const scoutId = await generateScoutId(scoutName);

    // Insert the new scout
    const newScout = await db
      .insert(scouts)
      .values({
        scoutId,
        scoutName,
        daftarId: daftarId,
      })
      .returning();

    // Link scout to daftar
    await db.insert(daftarScouts).values({
      scoutId,
      daftarId,
    });

    // Fetch all investors for the given daftarId
    const daftarMembers = await db
      .select({ investorId: daftarInvestors.investorId })
      .from(daftarInvestors)
      .where(eq(daftarInvestors.daftarId, daftarId));

    // Insert all members into scoutApproved
    if (daftarMembers.length > 0) {
      const approvedInserts = daftarMembers.map((member) => ({
        scoutId,
        investorId: member.investorId,
        isApproved: null,
        approvedAt: null,
      }));

      await db.insert(scoutApproved).values(approvedInserts);
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
