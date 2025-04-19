import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
  pitch,
  pitchTeam,
  pitchFocusSectors,
  pitchDocs,
  founderAnswers,
  investorPitch,
} from "@/backend/drizzle/models/pitch";
import {
  users,
  userLanguages,
  languages,
} from "@/backend/drizzle/models/users";
import { focusSectors } from "@/backend/drizzle/models/pitch";
import { scoutQuestions } from "@/backend/drizzle/models/scouts";
import { auth } from "@/auth";
import { eq, inArray, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = await new URL(req.url);
    const pitchId = searchParams.get("pitchId");
    if (!pitchId) {
      return NextResponse.json({ error: "No pitch ID found" }, { status: 404 });
    }
    // Fetch user to get user.id
    const userExist = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    const dbUser = userExist[0];
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user is part of the pitch team
    const userPitchTeam = await db
      .select({ pitchId: pitchTeam.pitchId })
      .from(pitchTeam)
      .where(
        and(eq(pitchTeam.userId, dbUser.id), eq(pitchTeam.pitchId, pitchId))
      );

    // Fetch pitch details
    const pitchData = await db
      .select({
        id: pitch.id,
        pitchName: pitch.pitchName,
        location: pitch.location,
        stage: pitch.stage,
        status: pitch.status,
        demoLink: pitch.demoLink,
        teamSize: pitch.teamSize,
        investorStatus: pitch.investorStatus,
        ask: pitch.askForInvestor,
        createdAt: pitch.createdAt,
      })
      .from(pitch)
      .where(eq(pitch.id, pitchId))
      .limit(1);

    if (!pitchData[0]) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    // Fetch focus sectors
    const sectors = await db
      .select({ sectorName: focusSectors.sectorName })
      .from(pitchFocusSectors)
      .innerJoin(
        focusSectors,
        eq(pitchFocusSectors.focusSectorId, focusSectors.id)
      )
      .where(eq(pitchFocusSectors.pitchId, pitchId));

    // Fetch team members with user details and languages
    const teamMembers = await db
      .select({
        userId: pitchTeam.userId,
        designation: pitchTeam.designation,
        firstName: users.name,
        lastName: users.lastName,
        email: users.email,
        location: users.location,
        gender: users.gender,
        dob: users.dob,
        image: users.image,
        number: users.number,
        countryCode: users.countryCode,
      })
      .from(pitchTeam)
      .innerJoin(users, eq(pitchTeam.userId, users.id))
      .where(eq(pitchTeam.pitchId, pitchId));

    // Fetch documents with uploader details
    const documents = await db
      .select({
        id: pitchDocs.id,
        docName: pitchDocs.docName,
        uploadedAt: pitchDocs.uploadedAt,
        uploadedById: pitchDocs.uploadedBy,
        uploadedByName: users.name,
      })
      .from(pitchDocs)
      .innerJoin(users, eq(pitchDocs.uploadedBy, users.id))
      .where(eq(pitchDocs.pitchId, pitchId));

    // Fetch founder answers
    const answers = await db
      .select({
        id: founderAnswers.id,
        questionId: founderAnswers.questionId,
        question: scoutQuestions.scoutQuestion,
        pitchAnswerUrl: founderAnswers.pitchAnswerUrl,
      })
      .from(founderAnswers)
      .innerJoin(
        scoutQuestions,
        eq(founderAnswers.questionId, scoutQuestions.id)
      )
      .where(eq(founderAnswers.pitchId, pitchId));

    // Fetch investor analysis
    const investorAnalysis = await db
      .select({
        id: investorPitch.id,
        believeRating: investorPitch.believeRating,
        note: investorPitch.note,
        analysis: investorPitch.analysis,
        submittedOn: investorPitch.submittedOn,
        investorId: investorPitch.investorId,
        investorName: users.name,
        investorRole: users.role,
        investorImage: users.image,
      })
      .from(investorPitch)
      .innerJoin(users, eq(investorPitch.investorId, users.id))
      .where(eq(investorPitch.pitchId, pitchId));
    // Fetch preferred languages for all team members
    const userIds = teamMembers.map((member) => member.userId);

    const filteredUserIds = userIds.filter((id): id is string => id !== null);

    const userLangData = await db
      .select({
        userId: userLanguages.userId,
        language: languages.language_name,
      })
      .from(userLanguages)
      .innerJoin(languages, eq(userLanguages.languageId, languages.id))
      .where(inArray(userLanguages.userId, filteredUserIds));

    // Build a map of userId to list of language names
    const languageMap: Record<string, string[]> = {};
    userLangData.forEach(({ userId, language }) => {
      if (!languageMap[userId]) languageMap[userId] = [];
      languageMap[userId].push(language);
    });

    // Combine data
    const response = {
      id: pitchData[0].id,
      pitchName: pitchData[0].pitchName,
      daftarName: pitchData[0].pitchName,
      status: pitchData[0].status || "In Review",
      teamMembers: teamMembers.map((member) => ({
        firstName: member.firstName,
        lastName: member.lastName || "",
        age: member.dob
          ? Math.floor(
              (new Date().getTime() - new Date(member.dob).getTime()) /
                (1000 * 60 * 60 * 24 * 365)
            ).toString()
          : "Unknown",
        email: member.email,
        phone:
          member.countryCode && member.number
            ? `${member.countryCode}${member.number}`
            : "",
        gender: member.gender || "Unknown",
        location: member.location || "Unknown",
        imageUrl: member.image,
        designation: member.designation,
        languages: languageMap[member?.userId || ""] || [], // 👈 add this line
      })),

      fields: {
        investorsNote: investorAnalysis[0]?.note || "",
        documentation: documents.map((doc) => ({
          id: doc.id,
          name: doc.docName,
          uploadedBy: doc.uploadedByName,
          uploadedAt: doc.uploadedAt
            ? doc.uploadedAt.toISOString().split("T")[0]
            : "Unknown",
        })),
        foundersPitch: {
          status: pitchData[0].status || "Under Review",
          location: pitchData[0].location || "Unknown",
          stage: pitchData[0].stage || "Seed",
          ask: pitchData[0].ask || "Unknown",
          sectors: sectors.map((s) => s.sectorName),
          questions: answers.map((a) => ({
            id: a.id,
            question: a.question,
            videoUrl: a.pitchAnswerUrl,
          })),
        },
        analysis: {
          performanceData: [45, 52, 38, 65, 78], // Mocked as not in schema
          investmentDistribution: [30, 25, 20, 15, 10], // Mocked
        },
        teamAnalysis: investorAnalysis.map((a) => ({
          id: a.id.toString(),
          analyst: {
            name: a.investorName,
            role: a.investorRole,
            avatar: a.investorImage || "/avatars/default.jpg",
            daftarName: pitchData[0].pitchName,
          },
          belief: a.believeRating && a.believeRating >= 5 ? "yes" : "no",
          note: a.analysis || "",
          nps: a.believeRating || 0,
          date: a.submittedOn?.toISOString() || new Date().toISOString(),
        })),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching pitch:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch" },
      { status: 500 }
    );
  }
}
