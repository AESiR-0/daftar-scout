import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, founderAnswers } from "@/backend/drizzle/models/pitch";
import { scoutQuestions } from "@/backend/drizzle/models/scouts";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();
    const { pitchId, pitchAnswerUrl, questionId, answerLanguage } = await body;

    // Validate parameters
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId is required" },
        { status: 400 }
      );
    }
    if (!pitchAnswerUrl || typeof pitchAnswerUrl !== "string") {
      return NextResponse.json(
        { error: "pitchAnswerUrl is required and must be a string" },
        { status: 400 }
      );
    }
    if (!questionId || !Number.isInteger(questionId) || questionId < 1) {
      return NextResponse.json(
        { error: "questionId is required and must be a positive integer" },
        { status: 400 }
      );
    }
    if (answerLanguage && typeof answerLanguage !== "string") {
      return NextResponse.json(
        { error: "answerLanguage must be a string if provided" },
        { status: 400 }
      );
    }

    // Verify pitch exists
    const pitchCheck = await db
      .select()
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (pitchCheck.length === 0) {
      return NextResponse.json(
        { error: "Pitch not found for this pitchId" },
        { status: 404 }
      );
    }

    // Verify question exists (assuming questionId references scoutQuestions.id)
    const questionCheck = await db
      .select()
      .from(scoutQuestions)
      .where(eq(scoutQuestions.id, questionId))
      .limit(1);

    if (questionCheck.length === 0) {
      return NextResponse.json(
        { error: "Question not found for this questionId" },
        { status: 404 }
      );
    }
    const compressedVideoUrl = pitchAnswerUrl.replace(process.env.AWS_S3_BUCKET_NAME!, process.env.AWS_S3_COMPRESSION_BUCKET_NAME!) ?? pitchAnswerUrl;
    // Upsert founder answer: update if exists, insert if not
    const updated = await db
      .update(founderAnswers)
      .set({
        pitchAnswerUrl,
        compressedPitchAnswerUrl: compressedVideoUrl,
        answerLanguage,
      })
      .where(
        and(
          eq(founderAnswers.pitchId, pitchId),
          eq(founderAnswers.questionId, questionId)
        )
      )
      .returning({
        id: founderAnswers.id,
        pitchId: founderAnswers.pitchId,
        pitchAnswerUrl: founderAnswers.pitchAnswerUrl,
        questionId: founderAnswers.questionId,
        answerLanguage: founderAnswers.answerLanguage,
      });

    let newAnswer = updated;
    if (updated.length === 0) {
      newAnswer = await db
        .insert(founderAnswers)
        .values({
          pitchId,
          pitchAnswerUrl,
          compressedPitchAnswerUrl: compressedVideoUrl,
          questionId,
          answerLanguage,
        })
        .returning({
          id: founderAnswers.id,
          pitchId: founderAnswers.pitchId,
          pitchAnswerUrl: founderAnswers.pitchAnswerUrl,
          questionId: founderAnswers.questionId,
          answerLanguage: founderAnswers.answerLanguage,
        });
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Answer submitted successfully",
        answer: newAnswer[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting founder answer:", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}