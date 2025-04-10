import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scoutQuestions } from "@/backend/drizzle/models/scouts";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    // Validate path parameter
    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
    }

    // Fetch scout questions
    const questions = await db
      .select({
        id: scoutQuestions.id,
        scoutId: scoutQuestions.scoutId,
        scoutQuestion: scoutQuestions.scoutQuestion,
        scoutAnswerSampleUrl: scoutQuestions.scoutAnswerSampleUrl,
        language: scoutQuestions.language,
        isCustom: scoutQuestions.isCustom,
        isSample: scoutQuestions.isSample,
      })
      .from(scoutQuestions)
      .where(eq(scoutQuestions.scoutId, scoutId));

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error("Error fetching scout questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch scout questions" },
      { status: 500 }
    );
  }
}
