import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitch, investorPitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { scouts, daftarScouts } from "@/backend/drizzle/models/scouts";
import { users, userLanguages, languages } from "@/backend/drizzle/models/users";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/mail/mailer";
import puppeteer from 'puppeteer-core';
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar";
import { offers } from "@/backend/drizzle/models/pitch";
import { inArray } from "drizzle-orm";


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
        daftarCreated: daftar.createdAt,
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

    // Fetch offers for all pitches
    const pitchIds = pitches.map(p => p.id);
    const offersData = await db
      .select({
        id: offers.id,
        pitchId: offers.pitchId,
        offerStatus: offers.offerStatus,
      })
      .from(offers)
      .where(inArray(offers.pitchId, pitchIds));

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

    // Fetch all users for gender ratio calculation
    const usersAll = await db
      .select({
        id: users.id,
        name: users.name,
        gender: users.gender,
        dob: users.dob,
      })
      .from(users);

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
    const scoutStartDate = new Date(scout[0].programLaunchDate || "");
    const scoutEndDate = new Date(scout[0].lastDayToPitch || "");
    const totalDays = Math.ceil((scoutEndDate.getTime() - scoutStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 8; // Assuming 8 hours per day
    const totalMeetings = pitches.length;

    // Generate HTML content
    const currentDate = new Date();
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const formattedDate = currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });

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
            .header-info {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: #f9f9f9;
              border-radius: 5px;
            }
            .header-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            .cover-page {
              text-align: center;
              padding: 40px 20px;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
            }
            .cover-image {
              width: 250px;
              height: 250px;
              margin: 0 auto;
            }
            .cover-title {
              color: #11574f;
              margin: 40px 0;
            }
            .cover-details {
              text-align: left;
              margin: 20px auto;
              max-width: 600px;
            }
            .cover-details p {
              margin: 10px 0;
              font-size: 16px;
            }
            .cover-footer {
              position: absolute;
              width: 100%;
              text-align: center;
            }
            .cover-footer p {
              bottom: 0px;
              margin: 5px 0;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="cover-page">
            <div>
              <img src="https://res.cloudinary.com/dnqkxuume/image/upload/v1748519250/WhatsApp_Image_2025-05-29_at_09.40.54_39ea4402_miir2b.jpg" 
                   alt="Daftar OS" 
                   class="cover-image" />
              <br/><br/>
              <h1 class="cover-title">Startup Scouting Summary</h1>
              <div class="cover-details">
                <p><strong>Scout name:</strong> ${scout[0].scoutName}</p>
                <p><strong>Collaboration Daftars:</strong> ${daftarCollaborations.map(c => c.daftarName).join(', ')}</p>
                <p><strong>Publish Date:</strong> ${formattedDate}</p>
                <p><strong>Pages:</strong> <span id="total-pages">Calculating...</span></p>
                <p><strong>Published By</strong></p>
                <p>Daftar OS Technology</p>
                <p>www.daftaros.com</p>
              </div>
            </div>           
          </div>


          <!-- Page 2 Content -->
          <div class="section">
            <h3 style="color: #11574f;">Scout Vision</h3>
            <p>${scout[0].scoutDetails || 'N/A'}</p>
          </div>

          <div class="section">
            <h3 style="color: #11574f;">Daftar's Collaboration</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Daftar Name</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Location</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Team Size</th>
                </tr>
              </thead>
              <tbody>
                ${daftarCollaborations.map(collab => `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                      ${collab.daftarName || 'N/A'}<br/>
                      <span style="color: #666; font-size: 0.9em;">on Daftar since ${collab.daftarCreated ? new Date(collab.daftarCreated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;">${collab.daftarLocation || 'N/A'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;">${daftarTeam.filter(member => member.status === 'active').length}</td>
                  </tr>
              `).join('')}
              </tbody>
            </table>
          </div>

          <div class="page-break"></div>

          <!-- Page 3 Content -->
          <div class="section">
            <h3 style="color: #11574f;">Scout Target Audience</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;"><strong>Community</strong></td>
                <td style="padding: 12px; border: 1px solid #ddd;">${scout[0].scoutCommunity || 'N/A'}</td>
                </tr>
                <tr>
                <td style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;"><strong>Location</strong></td>
                <td style="padding: 12px; border: 1px solid #ddd;">${scout[0].targetAudLocation || 'N/A'}</td>
                </tr>
                <tr>
                <td style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;"><strong>Age</strong></td>
                <td style="padding: 12px; border: 1px solid #ddd;">${scout[0].targetAudAgeStart || 'N/A'} - ${scout[0].targetAudAgeEnd || 'N/A'}</td>
                </tr>
                <tr>
                <td style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;"><strong>Gender</strong></td>
                <td style="padding: 12px; border: 1px solid #ddd;">${scout[0].targetedGender || 'N/A'}</td>
                </tr>
                <tr>
                <td style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;"><strong>Stage</strong></td>
                <td style="padding: 12px; border: 1px solid #ddd;">${scout[0].scoutStage || 'N/A'}</td>
                </tr>
                <tr>
                <td style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;"><strong>Sector</strong></td>
                <td style="padding: 12px; border: 1px solid #ddd;">${scout[0].scoutSector || 'N/A'}</td>
              </tr>
            </table>
          </div>

                 <!-- Page 3 Content -->
          <div class="section">
            <h3 style="color: #11574f;">Scout Target Audience</h3>
                
                <div style="margin: 20px 0;">
                  <p><strong>Total Meetings with Startups:</strong> ${totalMeetings}</p>
                  <p><strong>Total Scouting Time:</strong> ${totalHours} hours</p>
                  <p><strong>Scouting Period:</strong> ${scoutStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to ${scoutEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                  
            </div>
          <div class="section">
            <h3 style="color: #11574f;">Startup Overview</h3>
            <div style="margin: 20px 0;">
              <p><strong>Startups pitched:</strong> ${pitches.length}</p>
              <p><strong>Startups selected:</strong> ${offersData.filter(o => o.offerStatus === 'accepted').length}</p>
              <p><strong>Startups not selected:</strong> ${offersData.filter(o => o.offerStatus === 'rejected' || o.offerStatus === 'declined').length}</p>
              <p><strong>Startups withdrawn in the process:</strong> ${offersData.filter(o => o.offerStatus === 'withdrawn').length}</p>
              <p><strong>Startups who didn't accept the offer:</strong> ${offersData.filter(o => o.offerStatus === 'pending').length}</p>
            </div>
          </div>

          <div class="section">
            <h3 style="color: #11574f;">Startup Insights</h3>
            <div style="margin: 20px 0;">
              <h3>NPS (Net Promoter Score)</h3>
              <p>Investors typically rate startups on a scale from 1 to 10 after their experience, where 1 is the lowest score and 10 is the highest.</p>
              <p><strong>Avg:</strong> Average  </p>
            </div>
          </div>

          <div class="section">
            <h3 style="color: #11574f;">Startups Pitched</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Location</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">#Startups</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Avg Team</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Avg Age</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Avg NPS</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Gender Ratio</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
        const allPitches = pitches;
        const locations = Array.from(new Set(allPitches.map(p => p.location || 'Unknown')));
        return locations.map(location => {
          const locPitches = allPitches.filter(p => (p.location || 'Unknown') === location);
          const numStartups = locPitches.length;
          const avgTeam = numStartups ? (locPitches.reduce((acc, p) => {
            const team = pitchTeams.filter(pt => pt.pitchId === p.id);
            return acc + team.length;
          }, 0) / numStartups).toFixed(0) : '-';
          const ages = locPitches.flatMap(p => {
            const team = pitchTeams.filter(pt => pt.pitchId === p.id);
            return team.map(pt => {
              const userMember = usersAll.find(m => m.id === pt.userId);
              return userMember ? calculateAge(userMember.dob) : null;
            }).filter(a => a !== null);
          });
          const avgAge = ages.length ? (ages.reduce((a, b) => a! + (b as number), 0) / ages.length).toFixed(0) : '-';
          const npsArr = locPitches.map(p => {
            const inv = investorData.find(d => d.pitchId === p.id);
            return inv?.believeRating || null;
          }).filter(n => n !== null);
          const avgNps = npsArr.length ? (npsArr.reduce((a, b) => a! + (b as number), 0) / npsArr.length).toFixed(1) : '-';
          const genderCounts = { male: 0, female: 0, trans: 0 };
          locPitches.forEach(p => {
            const team = pitchTeams.filter(pt => pt.pitchId === p.id);
            team.forEach(pt => {
              const member = usersAll.find(m => m.id === pt.userId);
              if (member) {
                if (member.gender === 'male') genderCounts.male++;
                else if (member.gender === 'female') genderCounts.female++;
                else if (member.gender === 'trans') genderCounts.trans++;
              }
            });
          });
          const genderRatio = `Male:${genderCounts.male}, Female:${genderCounts.female} & Trans:${genderCounts.trans}`;
          return `<tr>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${location}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${numStartups}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${avgTeam}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${avgAge}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${avgNps}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${genderRatio}</td>
                    </tr>`;
        }).join('');
      })()}
              </tbody>
            </table>
          </div>

          <div class="page-break"></div>

          <!-- Page 4 Content -->
          <div class="section">
            <h3 style="color: #11574f;">Startup Selected</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Location</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">#Startups</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Avg Team</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Avg Age</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Avg NPS</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Gender Ratio</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
        const acceptedPitches = pitches.filter(p => p.status === 'accepted');
        const locations = Array.from(new Set(acceptedPitches.map(p => p.location || 'Unknown')));
        return locations.map(location => {
          const locPitches = acceptedPitches.filter(p => (p.location || 'Unknown') === location);
          const numStartups = locPitches.length;
          const avgTeam = numStartups ? (locPitches.reduce((acc, p) => {
            const team = pitchTeams.filter(pt => pt.pitchId === p.id);
            return acc + team.length;
          }, 0) / numStartups).toFixed(0) : '-';
          const ages = locPitches.flatMap(p => {
            const team = pitchTeams.filter(pt => pt.pitchId === p.id);
            return team.map(pt => {
              const userMember = usersAll.find(m => m.id === pt.userId);
              return userMember ? calculateAge(userMember.dob) : null;
            }).filter(a => a !== null);
          });
          const avgAge = ages.length ? (ages.reduce((a, b) => a! + (b as number), 0) / ages.length).toFixed(0) : '-';
          const npsArr = locPitches.map(p => {
            const inv = investorData.find(d => d.pitchId === p.id);
            return inv?.believeRating || null;
          }).filter(n => n !== null);
          const avgNps = npsArr.length ? (npsArr.reduce((a, b) => a! + (b as number), 0) / npsArr.length).toFixed(1) : '-';
          const genderCounts = { male: 0, female: 0, trans: 0 };
          locPitches.forEach(p => {
            const team = pitchTeams.filter(pt => pt.pitchId === p.id);
            team.forEach(pt => {
              const member = usersAll.find(m => m.id === pt.userId);
              if (member) {
                if (member.gender === 'male') genderCounts.male++;
                else if (member.gender === 'female') genderCounts.female++;
                else if (member.gender === 'trans') genderCounts.trans++;
              }
            });
          });
          const genderRatio = `Male:${genderCounts.male}, Female:${genderCounts.female} & Trans:${genderCounts.trans}`;
          return `<tr>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${location}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${numStartups}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${avgTeam}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${avgAge}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${avgNps}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${genderRatio}</td>
                    </tr>`;
        }).join('');
      })()}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3 style="color: #11574f;">Startup Not Selected</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Location</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">#Startups</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Avg Team</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Avg Age</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Avg NPS</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Gender Ratio</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
        const rejectedPitches = pitches.filter(p => p.status === 'rejected');
        const locations = Array.from(new Set(rejectedPitches.map(p => p.location || 'Unknown')));
        return locations.map(location => {
          const locPitches = rejectedPitches.filter(p => (p.location || 'Unknown') === location);
          const numStartups = locPitches.length;
          const avgTeam = numStartups ? (locPitches.reduce((acc, p) => {
            const team = pitchTeams.filter(pt => pt.pitchId === p.id);
            return acc + team.length;
          }, 0) / numStartups).toFixed(0) : '-';
          const ages = locPitches.flatMap(p => {
            const team = pitchTeams.filter(pt => pt.pitchId === p.id);
            return team.map(pt => {
              const userMember = usersAll.find(m => m.id === pt.userId);
              return userMember ? calculateAge(userMember.dob) : null;
            }).filter(a => a !== null);
          });
          const avgAge = ages.length ? (ages.reduce((a, b) => a! + (b as number), 0) / ages.length).toFixed(0) : '-';
          const npsArr = locPitches.map(p => {
            const inv = investorData.find(d => d.pitchId === p.id);
            return inv?.believeRating || null;
          }).filter(n => n !== null);
          const avgNps = npsArr.length ? (npsArr.reduce((a, b) => a! + (b as number), 0) / npsArr.length).toFixed(1) : '-';
          const genderCounts = { male: 0, female: 0, trans: 0 };
          locPitches.forEach(p => {
            const team = pitchTeams.filter(pt => pt.pitchId === p.id);
            team.forEach(pt => {
              const member = usersAll.find(m => m.id === pt.userId);
              if (member) {
                if (member.gender === 'male') genderCounts.male++;
                else if (member.gender === 'female') genderCounts.female++;
                else if (member.gender === 'trans') genderCounts.trans++;
              }
            });
          });
          const genderRatio = `Male:${genderCounts.male}, Female:${genderCounts.female} & Trans:${genderCounts.trans}`;
          return `<tr>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${location}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${numStartups}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${avgTeam}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${avgAge}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${avgNps}</td>
                      <td style='padding: 12px; border-bottom: 1px solid #ddd;'>${genderRatio}</td>
                    </tr>`;
        }).join('');
      })()}
              </tbody>
            </table>
          </div>

          <div class="page-break"></div>

          <!-- Page 5 Content -->
          <div class="section">
            <h3 style="color: #11574f;">Language Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Language</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">#Founders</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Investor Knows This Language</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
        // Build language summary
        const languageSummary: Record<string, { count: number }> = {};
        teamMembers.forEach(member => {
          const langs = userLangs.filter(l => l.userId === member.id).map(l => l.languageName);
          langs.forEach(lang => {
            if (!languageSummary[lang]) languageSummary[lang] = { count: 0 };
            languageSummary[lang].count += 1;
          });
        });
        // You should fetch or define investorLanguages here. For now, use an empty array as fallback.
        const investorLanguages: string[] = [];
        return Object.entries(languageSummary).map(([lang, data]) => {
          return `<tr>
                       <td style=\"padding: 12px; border-bottom: 1px solid #ddd;\">${lang}</td>
                       <td style=\"padding: 12px; border-bottom: 1px solid #ddd;\">${data.count}</td>
                       <td style=\"padding: 12px; border-bottom: 1px solid #ddd;\">${investorLanguages.includes(lang) ? "Yes" : "No"}</td>
                     </tr>`;
        }).join("");
      })()}
              </tbody>
            </table>
          </div>

          <div class="section" style="margin-top: 40px;">
            <h2 style="color: #11574f;">Report End</h2>
            <div style="margin: 20px 0; font-size: 16px;">
              <p>This is a short summary of the scout your team has launched on Daftar OS. It is shared for team members who are not yet on Daftar.<br>
              To access the full report, please request your team to add you in the software. Daftar gives you a live experience of the startup's journey, your team's decisions, and all related documents.</p>
              <p><strong>Feedback</strong><br>
              Daftar OS is currently in beta. Your experience and feedback are invaluable to us. Kindly share your insights via your profile in Daftar.</p>
              <p><strong>Daftar OS</strong><br>
              Simplifying startup scouting and pitching through data and intelligence.<br>
              <a href="https://www.daftaros.com" target="_blank">www.daftaros.com</a></p>
              <p style="font-size: 14px; color: #888;"><strong>Disclaimer</strong><br>
              This report is confidential and shared only with authorized team members. We respect your privacy and do not share information outside the team.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Launch browser
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser',
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

    // Calculate total pages
    const totalPages = await page.evaluate(() => {
      const pages = document.querySelectorAll('.page-break').length + 1;
      const totalPagesElement = document.getElementById('total-pages');
      if (totalPagesElement) {
        totalPagesElement.textContent = pages.toString();
      }
      return pages;
    });

    // Generate final PDF with page count
    const finalPdfBuffer = await page.pdf({
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

    await sendEmail({
      to: email,
      subject: "Scout Report",
      html: "Please find attached the scout report.",
      attachments: [{
        filename: `Daftar_OS_${scout[0].scoutName}_${currentDate.toLocaleString('default', { month: 'short' })}_${currentDate.getFullYear()}.pdf`,
        content: Buffer.from(finalPdfBuffer)
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