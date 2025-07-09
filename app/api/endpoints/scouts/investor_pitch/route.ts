import { NextResponse, NextRequest } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoUrl, scoutId } = body;

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
    }

    const existingScout = await db
      .select()
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (existingScout.length === 0) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }
    const compressedVideoUrl = videoUrl.replace(process.env.AWS_S3_BUCKET_NAME!, process.env.AWS_S3_COMPRESSION_BUCKET_NAME!) ?? videoUrl;

    const updatedScout = await db
      .update(scouts)
      .set({
        investorPitch: videoUrl,
        compressedInvestorPitch: compressedVideoUrl,
      })
      .where(eq(scouts.scoutId, scoutId))
      .returning();

    return NextResponse.json(
      { message: "Scout details updated successfully", data: updatedScout[0] },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update scout details" },
      { status: 500 }
    );
  }
}

// app/api/investor-pitch/route.ts (extend same file)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");

  if (!scoutId) {
    return NextResponse.json({ error: "Scout ID missing" }, { status: 400 });
  }

  const pitch = await db
    .select({ compressedUrl: scouts.compressedInvestorPitch, url: scouts.investorPitch })
    .from(scouts)
    .where(eq(scouts.scoutId, scoutId));
  const url = pitch[0].url;
  const compressedUrl = pitch[0].compressedUrl
  return NextResponse.json({ url, compressedUrl });
}
