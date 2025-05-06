import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database"; // Your Drizzle client
import { scoutQuestions } from "@/backend/drizzle/models/scouts"; // Your Drizzle schema
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");
  const language = searchParams.get("language");

  if (!scoutId) {
    return NextResponse.json({ error: "Missing scoutId" }, { status: 400 });
  }

  const whereClause = language
    ? and(
        eq(scoutQuestions.scoutId, scoutId),
        eq(scoutQuestions.language, language)
      )
    : eq(scoutQuestions.scoutId, scoutId);

  const questions = await db
    .select()
    .from(scoutQuestions)
    .where(whereClause)
    .orderBy(scoutQuestions.id);

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { scoutId, language = "English", questions } = body;

    if (!scoutId || !Array.isArray(questions) || questions.length !== 7) {
      return NextResponse.json(
        { error: "Missing scoutId or invalid questions array (must be 7)" },
        { status: 400 }
      );
    }

    // Check if questions already exist for this scout
    const existingQuestions = await db
      .select()
      .from(scoutQuestions)
      .where(
        and(
          eq(scoutQuestions.scoutId, scoutId),
          eq(scoutQuestions.language, language)
        )
      );

    if (existingQuestions.length > 0) {
      return NextResponse.json(
        { error: "Questions already exist. Use PATCH to update." },
        { status: 409 }
      );
    }

    // Insert new questions
    const valuesToInsert = questions.map((q: { question: string; isCustom?: boolean; videoUrl?: string }) => ({
      scoutId,
      language,
      scoutQuestion: q.question,
      isCustom: q.isCustom === false ? false : true,
      scoutAnswerSampleUrl: q.videoUrl || null
    }));

    await db.insert(scoutQuestions).values(valuesToInsert);

    return NextResponse.json({ success: true, message: "Questions created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating scout questions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { scoutId, language = "English", questions } = body;

    if (!scoutId || !Array.isArray(questions) || questions.length !== 7) {
      return NextResponse.json(
        { error: "Missing scoutId or invalid questions array (must be 7)" },
        { status: 400 }
      );
    }

    // Get existing questions to match with updates
    const existingQuestions = await db
      .select()
      .from(scoutQuestions)
      .where(
        and(
          eq(scoutQuestions.scoutId, scoutId),
          eq(scoutQuestions.language, language)
        )
      )
      .orderBy(scoutQuestions.id);

    if (existingQuestions.length !== 7) {
      return NextResponse.json(
        { error: "Incomplete question set. Use POST to create new questions." },
        { status: 400 }
      );
    }

    // Update each question individually
    await Promise.all(
      questions.map(async (q: { question: string; isCustom?: boolean; videoUrl?: string }, index: number) => {
        const existingQuestion = existingQuestions[index];
        if (!existingQuestion) return;

        return db
          .update(scoutQuestions)
          .set({
            scoutQuestion: q.question,
            isCustom: q.isCustom === false ? false : true,
            scoutAnswerSampleUrl: q.videoUrl || existingQuestion.scoutAnswerSampleUrl
          })
          .where(
            and(
              eq(scoutQuestions.id, existingQuestion.id),
              eq(scoutQuestions.scoutId, scoutId),
              eq(scoutQuestions.language, language)
            )
          );
      })
    );

    return NextResponse.json({ 
      success: true, 
      message: "Questions updated successfully" 
    });
  } catch (error) {
    console.error("Error updating scout questions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
