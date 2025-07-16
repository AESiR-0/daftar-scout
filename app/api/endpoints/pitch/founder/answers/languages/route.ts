import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { founderAnswers } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { pitchId, questionId, answerLanguage } = body;

    if (!pitchId || !questionId || !answerLanguage) {
      return NextResponse.json(
        { error: "pitchId, questionId, and answerLanguage are required" },
        { status: 400 }
      );
    }
    if (typeof answerLanguage !== "string") {
      return NextResponse.json(
        { error: "answerLanguage must be a string" },
        { status: 400 }
      );
    }

    // Check if the answer exists
    const existing = await db
      .select()
      .from(founderAnswers)
      .where(
        and(
          eq(founderAnswers.pitchId, pitchId),
          eq(founderAnswers.questionId, questionId)
        )
      );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Answer not found for this pitchId and questionId" },
        { status: 404 }
      );
    }

    // Update only the answerLanguage
    const updated = await db
      .update(founderAnswers)
      .set({ answerLanguage })
      .where(
        and(
          eq(founderAnswers.pitchId, pitchId),
          eq(founderAnswers.questionId, questionId)
        )
      )
      .returning({
        id: founderAnswers.id,
        pitchId: founderAnswers.pitchId,
        questionId: founderAnswers.questionId,
        answerLanguage: founderAnswers.answerLanguage,
      });

    return NextResponse.json(
      {
        status: "success",
        message: "Answer language updated successfully",
        answer: updated[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating answer language:", error);
    return NextResponse.json({ error: "Failed to update answer language" }, { status: 500 });
  }
} 