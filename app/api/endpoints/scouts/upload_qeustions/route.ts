// app/api/scout-questions/route.ts

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
    .orderBy(scoutQuestions.id); // optional

  return NextResponse.json(questions);
}
