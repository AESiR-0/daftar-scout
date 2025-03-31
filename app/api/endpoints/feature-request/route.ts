import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { featureRequests } from "@/backend/drizzle/models/featureRequest";

export async function GET(req: NextRequest) {
  try {
    const features = await db.select().from(featureRequests).execute();
    return NextResponse.json(features);
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { featureName, userId } = await req.json();
    await db.insert(featureRequests).values({ featureName, userId }).execute();
    return NextResponse.json(
      { message: "Feature request submitted" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feature:", error);
    return NextResponse.json(
      { error: "Failed to submit feature" },
      { status: 500 }
    );
  }
}
