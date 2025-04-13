import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database"; // Your Drizzle client
import { scoutQuestions } from "@/backend/drizzle/models/scouts"; // Your Drizzle schema
import { eq, and } from "drizzle-orm";

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
    const body = await req.json();
    const { scoutId, language, questions } = body;

    if (!scoutId || !Array.isArray(questions) || questions.length !== 7) {
      return NextResponse.json(
        { error: "Missing scoutId or invalid questions array (must be 7)" },
        { status: 400 }
      );
    }

    // Delete old questions for that scout and language
    await db
      .delete(scoutQuestions)
      .where(
        and(
          eq(scoutQuestions.scoutId, scoutId),
          eq(scoutQuestions.language, language)
        )
      );

    // Prepare new questions
    const valuesToInsert = questions.map(
      (q: { question: string; isCustom?: boolean }) => {
        const base = {
          scoutId,
          language,
          scoutQuestion: q.question,
        };

        if (q.isCustom === false) {
          return { ...base, isCustom: false };
        }

        return base; // omit isCustom if true or undefined
      }
    );

    // Insert new 7 questions
    await db.insert(scoutQuestions).values(valuesToInsert);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error replacing scout questions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
