import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, investorPitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { scouts, daftarScouts } from "@/backend/drizzle/models/scouts";
import { users, userLanguages, languages } from "@/backend/drizzle/models/users";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/mail/mailer";
import puppeteer from 'puppeteer-core';
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar";


export async function POST(req: Request) {
  try {
    const { scoutId, email } = await req.json();

    if (!scoutId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch scout details
    const scout = await db
      .select({
        scoutName: scouts.scoutName,
        scoutDetails: scouts.scoutDetails,
        lastDayToPitch: scouts.lastDayToPitch,
        programLaunchDate: scouts.programLaunchDate,
        status: scouts.status,
        targetAudLocation: scouts.targetAudLocation,
        targetAudAgeStart: scouts.targetAudAgeStart,
        targetAudAgeEnd: scouts.targetAudAgeEnd,
        targetedGender: scouts.targetedGender,
        scoutCommunity: scouts.scoutCommunity,
        scoutStage: scouts.scoutStage,
        scoutSector: scouts.scoutSector,
      })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (!scout.length) {
      return NextResponse.json(
        { error: "Scout not found" },
        { status: 404 }
      );
    }

    // Fetch Daftar collaboration details
    const daftarCollaborations = await db
      .select({
        daftarId: daftar.id,
        daftarName: daftar.name,
        daftarStructure: daftar.structure,
        daftarWebsite: daftar.website,
        daftarLocation: daftar.location,
        daftarBigPicture: daftar.bigPicture,
        isPending: daftarScouts.isPending,
        addedAt: daftarScouts.addedAt,
      })
      .from(daftarScouts)
      .leftJoin(daftar, eq(daftarScouts.daftarId, daftar.id))
      .where(eq(daftarScouts.scoutId, scoutId));

    // Fetch Daftar team members
    const daftarTeam = await db
      .select({
        name: users.name,
        email: users.email,
        designation: daftarInvestors.designation,
        status: daftarInvestors.status,
        joinDate: daftarInvestors.joinDate,
        joinType: daftarInvestors.joinType,
      })
      .from(daftarInvestors)
      .leftJoin(users, eq(daftarInvestors.investorId, users.id))
      .where(eq(daftarInvestors.daftarId, daftarCollaborations[0]?.daftarId || ''));

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
        isCompleted: pitch.isCompleted,
        isPaid: pitch.isPaid,
        isLocked: pitch.isLocked,
        investorStatus: pitch.investorStatus,
      })
      .from(pitch)
      .where(eq(pitch.scoutId, scoutId));

    if (!pitches.length) {
      return NextResponse.json(
        { error: "No pitches found for this scout" },
        { status: 404 }
      );
    }

    // Fetch pitch team members
    const pitchTeams = await db
      .select({
        pitchId: pitchTeam.pitchId,
        userId: pitchTeam.userId,
        designation: pitchTeam.designation,
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitches[0].id));

    // Fetch team member details
    const teamMembers = await db
      .select({
        id: users.id,
        name: users.name,
        location: users.location,
        dob: users.dob,
        gender: users.gender,
      })
      .from(users)
      .where(eq(users.id, pitchTeams[0]?.userId || ''));

    // Fetch user languages
    const userLangs = await db
      .select({
        userId: userLanguages.userId,
        languageName: languages.language_name,
      })
      .from(userLanguages)
      .innerJoin(languages, eq(userLanguages.languageId, languages.id))
      .where(eq(userLanguages.userId, pitchTeams[0]?.userId || ''));

    // Calculate age from dob
    const calculateAge = (dob: string | Date | null) => {
      if (!dob) return null;
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Fetch investor ratings and analysis
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

    // Calculate NPS categories
    const npsCategories = {
      high: investorData.filter(d => d.believeRating && d.believeRating >= 8).length,
      average: investorData.filter(d => d.believeRating && d.believeRating >= 5 && d.believeRating < 8).length,
      low: investorData.filter(d => d.believeRating && d.believeRating < 5).length,
    };

    // Calculate pitch statistics by category
    const pitchCategories = {
      accepted: pitches.filter(p => p.status === 'accepted'),
      rejected: pitches.filter(p => p.status === 'rejected'),
      withdrawn: pitches.filter(p => p.status === 'withdrawn'),
    };

    // Calculate gender ratios
    const calculateGenderRatio = (members: any[]) => {
      const total = members.length;
      if (total === 0) return { male: 0, female: 0, trans: 0 };
      const male = members.filter(m => m.gender === 'male').length;
      const female = members.filter(m => m.gender === 'female').length;
      const trans = members.filter(m => m.gender === 'trans').length;
      return {
        male: (male / total) * 100,
        female: (female / total) * 100,
        trans: (trans / total) * 100,
      };
    };

    // Generate HTML content
    const currentDate = new Date();
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h2, h3 { color: #333; }
            h1 { text-align: center; }
            .section { margin-bottom: 30px; }
            .subsection { margin: 15px 0; }
            .pitch { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
            .disclaimer { 
              margin-top: 40px; 
              padding: 20px; 
              background-color: #f5f5f5; 
              border-radius: 5px;
              font-style: italic;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 20px 0;
            }
            .stat-item {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
            }
            .category-section {
              margin: 20px 0;
              padding: 15px;
              background: #f0f0f0;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <h1>Scout Report</h1>

          <div class="section">
            <h2>Scout Details</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <h3>Vision</h3>
                <p>${scout[0].scoutDetails || 'N/A'}</p>
              </div>
              <div class="stat-item">
                <h3>Live Status</h3>
                <p>${scout[0].status || 'N/A'}</p>
              </div>
              <div class="stat-item">
                <h3>Last Date to Pitch</h3>
                <p>${scout[0].lastDayToPitch ? new Date(scout[0].lastDayToPitch).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div class="stat-item">
                <h3>Program Launch Date</h3>
                <p>${scout[0].programLaunchDate ? new Date(scout[0].programLaunchDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Daftar Collaboration Details</h2>
            ${daftarCollaborations.map(collab => `
              <div class="stats-grid">
                <div class="stat-item">
                  <h3>Daftar Name</h3>
                  <p>${collab.daftarName || 'N/A'}</p>
                </div>
                <div class="stat-item">
                  <h3>Structure</h3>
                  <p>${collab.daftarStructure || 'N/A'}</p>
                </div>
                <div class="stat-item">
                  <h3>Website</h3>
                  <p>${collab.daftarWebsite || 'N/A'}</p>
                </div>
                <div class="stat-item">
                  <h3>Location</h3>
                  <p>${collab.daftarLocation || 'N/A'}</p>
                </div>
                <div class="stat-item">
                  <h3>Big Picture</h3>
                  <p>${collab.daftarBigPicture || 'N/A'}</p>
                </div>
                <div class="stat-item">
                  <h3>Collaboration Status</h3>
                  <p>${collab.isPending ? 'Pending' : 'Active'}</p>
                </div>
                <div class="stat-item">
                  <h3>Added At</h3>
                  <p>${collab.addedAt ? new Date(collab.addedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Daftar Team</h2>
            <div class="stats-grid">
              ${daftarTeam.map(member => `
                <div class="stat-item">
                  <h3>${member.name || 'N/A'}</h3>
                  <p><strong>Email:</strong> ${member.email || 'N/A'}</p>
                  <p><strong>Designation:</strong> ${member.designation || 'N/A'}</p>
                  <p><strong>Status:</strong> ${member.status || 'N/A'}</p>
                  <p><strong>Join Date:</strong> ${member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Join Type:</strong> ${member.joinType || 'N/A'}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <h2>Target Audience</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <h3>Community</h3>
                <p>${scout[0].scoutCommunity || 'N/A'}</p>
              </div>
              <div class="stat-item">
                <h3>Location</h3>
                <p>${scout[0].targetAudLocation || 'N/A'}</p>
              </div>
              <div class="stat-item">
                <h3>Age Range</h3>
                <p>${scout[0].targetAudAgeStart || 'N/A'} - ${scout[0].targetAudAgeEnd || 'N/A'}</p>
              </div>
              <div class="stat-item">
                <h3>Gender</h3>
                <p>${scout[0].targetedGender || 'N/A'}</p>
              </div>
              <div class="stat-item">
                <h3>Stage</h3>
                <p>${scout[0].scoutStage || 'N/A'}</p>
              </div>
              <div class="stat-item">
                <h3>Sector</h3>
                <p>${scout[0].scoutSector ? (Array.isArray(scout[0].scoutSector) ? scout[0].scoutSector.join(', ') : scout[0].scoutSector) : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Pitch Analysis</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <h3>Stage Distribution</h3>
                ${Object.entries(pitches.reduce((acc: Record<string, number>, p) => {
      acc[p.stage || 'Unknown'] = (acc[p.stage || 'Unknown'] || 0) + 1;
      return acc;
    }, {})).map(([stage, count]) =>
      `<p>${stage}: ${count}</p>`
    ).join('')}
              </div>
              <div class="stat-item">
                <h3>Location Distribution</h3>
                ${Object.entries(pitches.reduce((acc: Record<string, number>, p) => {
      acc[p.location || 'Unknown'] = (acc[p.location || 'Unknown'] || 0) + 1;
      return acc;
    }, {})).map(([location, count]) =>
      `<p>${location}: ${count}</p>`
    ).join('')}
              </div>
              <div class="stat-item">
                <h3>Preferred Languages</h3>
                ${Object.entries(userLangs.reduce((acc: Record<string, number>, l) => {
      acc[l.languageName] = (acc[l.languageName] || 0) + 1;
      return acc;
    }, {})).map(([lang, count]) =>
      `<p>${lang}: ${count}</p>`
    ).join('')}
              </div>
              <div class="stat-item">
                <h3>Age Range</h3>
                <p>${Math.min(...teamMembers.map(m => calculateAge(m.dob) || 0))} - ${Math.max(...teamMembers.map(m => calculateAge(m.dob) || 0))}</p>
              </div>
              <div class="stat-item">
                <h3>Gender Ratio</h3>
                ${(() => {
        const ratio = calculateGenderRatio(teamMembers);
        return `
                    <p>Male: ${ratio.male.toFixed(1)}%</p>
                    <p>Female: ${ratio.female.toFixed(1)}%</p>
                    <p>Trans: ${ratio.trans.toFixed(1)}%</p>
                  `;
      })()}
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Investor Analysis</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <h3>NPS Distribution</h3>
                <p>High: ${npsCategories.high}</p>
                <p>Average: ${npsCategories.average}</p>
                <p>Low: ${npsCategories.low}</p>
              </div>
              <div class="stat-item">
                <h3>Meeting Statistics</h3>
                <p>Total Startups to Meet: ${investorData.filter(d => d.shouldMeet).length}</p>
              </div>
            </div>
          </div>

          ${Object.entries(pitchCategories).map(([category, categoryPitches]) => `
            <div class="category-section">
              <h2>${category.charAt(0).toUpperCase() + category.slice(1)} Pitches</h2>
              <p>Total: ${categoryPitches.length}</p>
              <div class="stats-grid">
                <div class="stat-item">
                  <h3>Average NPS</h3>
                  <p>${(categoryPitches.reduce((acc, p) => {
        const pitchData = investorData.find(d => d.pitchId === p.id);
        return acc + (pitchData?.believeRating || 0);
      }, 0) / categoryPitches.length).toFixed(1)}</p>
                </div>
                <div class="stat-item">
                  <h3>Investor Interest</h3>
                  <p>Want to Meet: ${categoryPitches.filter(p => {
        const pitchData = investorData.find(d => d.pitchId === p.id);
        return pitchData?.shouldMeet;
      }).length}</p>
                  <p>Don't Want to Meet: ${categoryPitches.filter(p => {
        const pitchData = investorData.find(d => d.pitchId === p.id);
        return pitchData && !pitchData.shouldMeet;
      }).length}</p>
                </div>
              </div>
              ${categoryPitches.map(pitch => {
        const pitchInvestorData = investorData.find(d => d.pitchId === pitch.id);
        const pitchTeamMembers = teamMembers.filter(m =>
          pitchTeams.find(pt => pt.pitchId === pitch.id && pt.userId === m.id)
        );
        const pitchUserLangs = userLangs.filter(l =>
          pitchTeamMembers.some(m => m.id === l.userId)
        );
        return `
                  <div class="pitch">
                    <h3>${pitch.pitchName}</h3>
                    <p>Location: ${pitch.location || 'N/A'}</p>
                    <p>Stage: ${pitch.stage || 'N/A'}</p>
                    <p>Team Size: ${pitch.teamSize || 'N/A'}</p>
                    <h4>Team Members</h4>
                    ${pitchTeamMembers.map(member => `
                      <div class="team-member">
                        <p>Name: ${member.name || 'N/A'}</p>
                        <p>Location: ${member.location || 'N/A'}</p>
                        <p>Age: ${calculateAge(member.dob) || 'N/A'}</p>
                        <p>Gender: ${member.gender || 'N/A'}</p>
                        <p>Preferred Languages: ${pitchUserLangs
            .filter(l => l.userId === member.id)
            .map(l => l.languageName)
            .join(', ') || 'N/A'}</p>
                      </div>
                    `).join('')}
                    ${pitchInvestorData ? `
                      <h4>Investor Data</h4>
                      <p>NPS: ${pitchInvestorData.believeRating || 'N/A'}</p>
                      <p>Should Meet: ${pitchInvestorData.shouldMeet ? 'Yes' : 'No'}</p>
                    ` : ''}
                  </div>
                `;
      }).join('')}
            </div>
          `).join('')}

          <div class="disclaimer">
            <h2>Confidential Disclaimer</h2>
            <p>This report is private and only shared with users who have been added to the project. Daftar OS respects your privacy and does not share this information with any third parties.</p>
            <p><strong>Daftar Brief:</strong> Daftar OS Technology: Simplifying Startup - Scouting and Pitching with Data and Intelligence</p>
          </div>
        </body>
      </html>
    `;

    // Launch browser
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });

    // Create new page
    const page = await browser.newPage();

    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    // Close browser
    await browser.close();

    // Send email with PDF attachment
    await sendEmail({
      to: email,
      subject: "Scout Report",
      html: "Please find attached the scout report.",
      attachments: [{
        filename: `Daftar_OS_${scout[0].scoutName}_${currentDate.toLocaleString('default', { month: 'short' })}_${currentDate.getFullYear()}.pdf`,
        content: Buffer.from(pdfBuffer)
      }]
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