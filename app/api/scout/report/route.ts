import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, investorPitch } from "@/backend/drizzle/models/pitch";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/mail/mailer";

export async function POST(req: Request) {
  try {
    const { scoutId, email } = await req.json();

    if (!scoutId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch all pitches for this scout
    const pitches = await db
      .select({
        id: pitch.id,
        pitchName: pitch.pitchName,
        location: pitch.location,
        stage: pitch.stage,
        status: pitch.status,
        teamSize: pitch.teamSize,
        createdAt: pitch.createdAt,
      })
      .from(pitch)
      .where(eq(pitch.scoutId, scoutId));

    if (!pitches.length) {
      return NextResponse.json(
        { error: "No pitches found for this scout" },
        { status: 404 }
      );
    }

    // Fetch investor ratings and analysis for each pitch
    const pitchIds = pitches.map(p => p.id);
    const investorData = await db
      .select({
        pitchId: investorPitch.pitchId,
        believeRating: investorPitch.believeRating,
        shouldMeet: investorPitch.shouldMeet,
        analysis: investorPitch.analysis,
        status: investorPitch.status,
      })
      .from(investorPitch)
      .where(eq(investorPitch.scoutId, scoutId));

    // Calculate aggregate statistics
    const totalPitches = pitches.length;
    const pitchesByStage = pitches.reduce((acc: Record<string, number>, pitch) => {
      acc[pitch.stage || 'Unknown'] = (acc[pitch.stage || 'Unknown'] || 0) + 1;
      return acc;
    }, {});
    const pitchesByStatus = pitches.reduce((acc: Record<string, number>, pitch) => {
      acc[pitch.status || 'Unknown'] = (acc[pitch.status || 'Unknown'] || 0) + 1;
      return acc;
    }, {});
    const averageTeamSize = pitches.reduce((acc: number, pitch) => acc + (pitch.teamSize || 0), 0) / totalPitches;

    // Calculate investor statistics
    const totalRatings = investorData.filter(d => d.believeRating !== null).length;
    const averageRating = totalRatings > 0
      ? investorData.reduce((acc, d) => acc + (d.believeRating || 0), 0) / totalRatings
      : 0;
    const shouldMeetCount = investorData.filter(d => d.shouldMeet).length;
    const pitchesByInvestorStatus = investorData.reduce((acc: Record<string, number>, data) => {
      acc[data.status || 'Unknown'] = (acc[data.status || 'Unknown'] || 0) + 1;
      return acc;
    }, {});

    // Generate HTML report
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #333;">Scout Report</h1>
        
        <h2 style="color: #666; margin-top: 20px;">Summary Statistics</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Total Pitches:</strong> ${totalPitches}</p>
          <p><strong>Average Team Size:</strong> ${averageTeamSize.toFixed(1)}</p>
          <p><strong>Average Believe Rating:</strong> ${averageRating.toFixed(1)}</p>
          <p><strong>Pitches to Meet:</strong> ${shouldMeetCount}</p>
        </div>

        <h2 style="color: #666; margin-top: 20px;">Pitches by Stage</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${Object.entries(pitchesByStage)
            .map(([stage, count]) => `<p><strong>${stage}:</strong> ${count}</p>`)
            .join('')}
        </div>

        <h2 style="color: #666; margin-top: 20px;">Pitches by Status</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${Object.entries(pitchesByStatus)
            .map(([status, count]) => `<p><strong>${status}:</strong> ${count}</p>`)
            .join('')}
        </div>

        <h2 style="color: #666; margin-top: 20px;">Investor Analysis</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${Object.entries(pitchesByInvestorStatus)
            .map(([status, count]) => `<p><strong>${status}:</strong> ${count}</p>`)
            .join('')}
        </div>

        <h2 style="color: #666; margin-top: 20px;">Detailed Pitch List</h2>
        ${pitches.map(pitch => {
          const pitchInvestorData = investorData.find(d => d.pitchId === pitch.id);
          return `
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
              <h3 style="margin: 0 0 10px 0;">${pitch.pitchName}</h3>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${pitch.location || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Stage:</strong> ${pitch.stage || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${pitch.status || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Team Size:</strong> ${pitch.teamSize || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Created:</strong> ${pitch.createdAt ? new Date(pitch.createdAt).toLocaleDateString() : 'N/A'}</p>
              ${pitchInvestorData ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                  <p style="margin: 5px 0;"><strong>Believe Rating:</strong> ${pitchInvestorData.believeRating || 'N/A'}</p>
                  <p style="margin: 5px 0;"><strong>Should Meet:</strong> ${pitchInvestorData.shouldMeet ? 'Yes' : 'No'}</p>
                  <p style="margin: 5px 0;"><strong>Investor Status:</strong> ${pitchInvestorData.status || 'N/A'}</p>
                  ${pitchInvestorData.analysis ? `
                    <p style="margin: 5px 0;"><strong>Analysis:</strong></p>
                    <p style="margin: 5px 0; padding: 10px; background: #fff; border-radius: 3px;">${pitchInvestorData.analysis}</p>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Send email
    await sendEmail({
      to: email,
      subject: "Scout Report",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send report:", error);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 }
    );
  }
} 