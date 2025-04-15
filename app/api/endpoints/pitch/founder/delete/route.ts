import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitchDelete } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const pitchId = req.headers.get("pitch_id");

    // Validate path parameter
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitch_id is required" },
        { status: 400 }
      );
    }

    // Fetch deletion requests for the pitch
    const deleteRequests = await db
      .select({
        id: pitchDelete.id,
        pitch_id: pitchDelete.pitchId,
        founder_id: pitchDelete.founderId,
        is_agreed: pitchDelete.isAgreed,
      })
      .from(pitchDelete)
      .where(eq(pitchDelete.pitchId, pitchId));

    return NextResponse.json(deleteRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching pitch delete requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch delete requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const postBody = await req.json();
    const { pitchId } = await postBody;

    // Validate path parameter
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitch_id is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { founderId, isAgreed } = body;

    // Manual validation
    if (!founderId) {
      return NextResponse.json(
        { error: "founderId is required" },
        { status: 400 }
      );
    }
    if (typeof isAgreed !== "boolean") {
      return NextResponse.json(
        { error: "isAgreed must be a boolean" },
        { status: 400 }
      );
    }

    // Check if a deletion request already exists for this founder and pitch
    const existingRequest = await db
      .select()
      .from(pitchDelete)
      .where(
        and(
          eq(pitchDelete.pitchId, pitchId),
          eq(pitchDelete.founderId, founderId)
        )
      )
      .limit(1);

    if (existingRequest.length > 0) {
      // Update existing request
      await db
        .update(pitchDelete)
        .set({
          isAgreed,
        })
        .where(
          and(
            eq(pitchDelete.pitchId, pitchId),
            eq(pitchDelete.founderId, founderId)
          )
        );
    } else {
      // Insert new deletion request
      await db.insert(pitchDelete).values({
        pitchId,
        founderId,
        isAgreed,
      });
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Pitch delete request processed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing pitch delete request:", error);
    return NextResponse.json(
      { error: "Failed to process pitch delete request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");

    // Validate path parameter
    if (!pitchId) {
      return NextResponse.json(
        { error: "pitch_id is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { founderId } = body;

    // Manual validation
    if (!founderId) {
      return NextResponse.json(
        { error: "founderId is required" },
        { status: 400 }
      );
    }

    // Check if the deletion request exists
    const existingRequest = await db
      .select()
      .from(pitchDelete)
      .where(
        and(
          eq(pitchDelete.pitchId, pitchId),
          eq(pitchDelete.founderId, founderId)
        )
      )
      .limit(1);

    if (existingRequest.length === 0) {
      return NextResponse.json(
        { error: "Deletion request not found for this pitch and founder" },
        { status: 404 }
      );
    }

    // Delete the request
    await db
      .delete(pitchDelete)
      .where(
        and(
          eq(pitchDelete.pitchId, pitchId),
          eq(pitchDelete.founderId, founderId)
        )
      );

    return NextResponse.json(
      {
        status: "success",
        message: "Pitch delete request removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting pitch delete request:", error);
    return NextResponse.json(
      { error: "Failed to delete pitch delete request" },
      { status: 500 }
    );
  }
}
