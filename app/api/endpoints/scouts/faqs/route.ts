import { db } from "@/backend/database";
import { faqs } from "@/backend/drizzle/models/scouts";
// adjust path if needed
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");

    if (!scoutId) {
      return NextResponse.json({ error: "Missing scoutId" }, { status: 400 });
    }

    const data = await db.select().from(faqs).where(eq(faqs.scoutId, scoutId));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "FAQ ID is required" }, { status: 400 });
  }

  await db.delete(faqs).where(eq(faqs.id, Number(id)));
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scoutId, faqQuestion, faqAnswer } = body;

    if (!scoutId || !faqQuestion) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(faqs)
      .values({
        scoutId,
        faqQuestion,
        faqAnswer: faqAnswer || null,
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add FAQ" }, { status: 500 });
  }
}
