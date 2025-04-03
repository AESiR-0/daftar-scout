import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { featureRequests } from "@/backend/drizzle/models/reportAndRequests";

export async function GET(req: NextRequest) {
  try {
    const features = await db.select().from(featureRequests);
    return NextResponse.json(features);
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { featureName, description, userId } = await req.json();
    const [newFeature] = await db
      .insert(featureRequests)
      .values({ featureName, description, userId })
      .returning();
    return NextResponse.json({ message: "Feature request submitted", data: newFeature }, { status: 201 });
  } catch (error) {
    console.error("Error submitting feature:", error);
    return NextResponse.json({ error: "Failed to submit feature" }, { status: 500 });
  }
}