import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { users } from '@/backend/drizzle/models/users'
import { db } from "@/backend/database";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { scoutQuestions } from "@/backend/drizzle/models/scouts";
import { founderAnswers } from "@/backend/drizzle/models/pitch";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session || !session?.user || !session?.user?.email) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { scoutId, pitchName } = body;

  if (!scoutId || !pitchName) {
    return NextResponse.json(
      { message: "Missing scoutId or pitchName" },
      { status: 400 }
    );
  }

  const pitchId = nanoid();
  const user = await db.select({ userId: users.id }).from(users).where(eq(users.email, session.user.email))
  if (user.length == 0)
    return NextResponse.json({ error: "User does not exist" }, { status: 500 })
  const { userId } = user[0]
  await db.insert(pitch).values({
    id: pitchId,
    scoutId,
    pitchName,
    investorStatus: "Inbox"
  });
  await db.insert(pitchTeam).values({
    pitchId: pitchId,
    userId: userId,
    designation: 'Founder', 
    invitationAccepted: true,
  })

  // Insert founder_answers for each question in scout_questions for this scout
  const questions = await db.select().from(scoutQuestions).where(eq(scoutQuestions.scoutId, scoutId));
  if (questions.length > 0) {
    await db.insert(founderAnswers).values(
      questions.map(q => ({ pitchId, questionId: q.id, pitchAnswerUrl: "" }))
    );
  }

  return NextResponse.json({ pitchId });
}
