import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scoutQuestions } from "@/backend/drizzle/models/scouts";
import { founderAnswers } from "@/backend/drizzle/models/pitch";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    const pitchId = searchParams.get("pitchId"); // 👈 required to find founder answers

    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "scoutId and pitchId are required" },
        { status: 400 }
      );
    }

    const questions = await db
      .select({
        id: scoutQuestions.id,
        scoutId: scoutQuestions.scoutId,
        scoutQuestion: scoutQuestions.scoutQuestion,
        scoutAnswerSampleUrl: scoutQuestions.scoutAnswerSampleUrl,
        language: scoutQuestions.language,
        isCustom: scoutQuestions.isCustom,
      })
      .from(scoutQuestions)
      .where(eq(scoutQuestions.scoutId, scoutId));

    const answers = await db
      .select({
        questionId: founderAnswers.questionId,
        pitchAnswerUrl: founderAnswers.pitchAnswerUrl,
        answerLanguage: founderAnswers.answerLanguage,
      })
      .from(founderAnswers)
      .where(eq(founderAnswers.pitchId, pitchId));

    // Map questionId to answer
    const answerMap = new Map(
      answers.map((a) => [
        Number(a.questionId), // Convert string ID to number for consistent comparison
        { url: a.pitchAnswerUrl, language: a.answerLanguage },
      ])
    );

    const response = questions.map((q) => ({
      ...q,
      answerUrl: answerMap.get(Number(q.id))?.url ?? q.scoutAnswerSampleUrl,
      answerLanguage: answerMap.get(Number(q.id))?.language ?? null,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching scout questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch scout questions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pitchId, questionId, pitchAnswerUrl, answerLanguage } = body;

    if (!pitchId || !questionId || !pitchAnswerUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await db.insert(founderAnswers).values({
      pitchId,
      questionId,
      pitchAnswerUrl,
      answerLanguage,
    });

    return NextResponse.json({ message: "Answer submitted" }, { status: 200 });
  } catch (error) {
    console.error("Error saving founder answer:", error);
    return NextResponse.json(
      { error: "Failed to submit founder answer" },
      { status: 500 }
    );
  }
}
