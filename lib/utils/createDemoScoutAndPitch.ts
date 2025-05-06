import { db } from "@/backend/database";
import { daftar, daftarInvestors, structure, daftarStructure } from "@/backend/drizzle/models/daftar";
import { scouts, scoutQuestions } from "@/backend/drizzle/models/scouts";
import { pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { users } from "@/backend/drizzle/models/users";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { nanoid } from "nanoid";

/**
 * Creates demo content for a user based on their role
 * @param userId - The ID of the user to create demo content for
 * @returns An object containing the created IDs, or null if creation failed
 */
export async function createDemoContent(userId: string): Promise<{ daftarId?: string, scoutId: string, pitchId: string } | null> {
  try {
    // Get user to check role
    const userResult = await db.select().from(users).where(eq(users.id, userId));

    if (userResult.length === 0) {
      console.log(`User ${userId} not found`);
      return null;
    }

    const user = userResult[0];
    const isInvestor = user.role === "investor";

    let daftarId: string | undefined;
    let scoutId: string;

    // If user is an investor, create a daftar first
    if (isInvestor) {
      // Check if user already has a demo daftar
      const existingDaftars = await db
        .select()
        .from(daftarInvestors)
        .where(eq(daftarInvestors.investorId, userId));

      if (existingDaftars.length === 0) {
        // Create a demo daftar
        daftarId = nanoid();

        await db.insert(daftar).values({
          id: daftarId,
          name: "Demo Daftar",
          profileUrl: "",
          structure: "Venture Capital",
          website: "https://example.com",
          type: "VC",
          bigPicture: "This is a demo daftar to help you get started with DaftarOS.",
          location: "Global",
          teamSize: 5,
          isActive: true
        });

        // Create a structure
        const [structureResult] = await db.insert(structure).values({
          name: "Venture Capital",
          description: "A demo structure for your daftar",
          createdBy: userId
        }).returning();

        // Link structure to daftar
        await db.insert(daftarStructure).values({
          daftarId,
          structureId: structureResult.id
        });

        // Add user to daftarInvestors
        await db.insert(daftarInvestors).values({
          daftarId,
          investorId: userId,
          status: "active",
          designation: "Founder",
          joinType: "creator",
          joinDate: new Date()
        });

        console.log(`Created demo daftar for investor ${userId}`);
      } else {
        // Use existing daftar
        const existingDaftarId = existingDaftars[0].daftarId;
        if (existingDaftarId) {
          daftarId = existingDaftarId;
          console.log(`Using existing daftar ${daftarId} for investor ${userId}`);
        }
      }
    }

    // Check if user already has a demo scout
    let existingScouts;
    if (isInvestor && daftarId) {
      existingScouts = await db
        .select()
        .from(scouts)
        .where(and(
          eq(scouts.scoutName, "Demo Scout"),
          eq(scouts.daftarId, daftarId)
        ));
    } else {
      existingScouts = await db
        .select()
        .from(scouts)
        .where(and(
          eq(scouts.scoutName, "Demo Scout"),
          eq(scouts.daftarId, userId)
        ));
    }

    if (existingScouts.length > 0) {
      console.log(`User ${userId} already has a demo scout`);
      return null;
    }

    // Create a demo scout
    scoutId = "demo-" + nanoid();
    await db.insert(scouts).values({
      scoutId,
      daftarId: isInvestor && daftarId ? daftarId : userId,
      scoutName: "Demo Scout",
      scoutDetails: "This is a demo scout to help you get started with DaftarOS.",
      scoutSector: [],
      lastDayToPitch: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      programLaunchDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      status: "Planning",
      isApprovedByAll: false,
      isArchived: false,
      deleteIsAgreedByAll: false,
      isLocked: false
    });

    // Create demo questions for the scout
    const demoQuestions = [
      "What problem does your startup solve?",
      "Who is your target audience?",
      "What is your business model?",
      "Who are your competitors?",
      "What is your go-to-market strategy?",
      "What is your current traction?",
      "How will you use the investment?"
    ];

    for (const question of demoQuestions) {
      await db.insert(scoutQuestions).values({
        scoutId: scoutId,
        scoutQuestion: question,
        isCustom: true
      });
    }

    // Create a demo pitch linked to the scout
    const pitchId = nanoid();

    await db.insert(pitch).values({
      id: pitchId,
      pitchName: "Demo Pitch",
      location: "Global",
      scoutId: scoutId,
      demoLink: "https://example.com/demo",
      stage: "Seed",
      askForInvestor: "Looking for seed investment of $500,000",
      status: "Inbox",
      isCompleted: false,
      teamSize: 1,
      isPaid: true,
      isLocked: false,
      investorStatus: "Inbox"
    });

    // If user is a founder, add them to the pitch team
    if (user.role === "founder") {
      await db.insert(pitchTeam).values({
        pitchId: pitchId,
        userId: userId,
        designation: "Founder",
        hasApproved: true
      });
    }

    console.log(`Created demo scout and pitch for user ${userId}`);
    return { daftarId, scoutId, pitchId };
  } catch (error) {
    console.error(`Error creating demo content for user ${userId}:`, error);
    return null;
  }
} 