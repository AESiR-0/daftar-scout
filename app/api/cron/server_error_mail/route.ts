import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMPTP_HOST = process.env.SMTP_HOST ?? "mail.smtp2go.com";
const SMPTP_PORT = process.env.SMPTP_PORT ?? '2525';
const transporter = nodemailer.createTransport({
    host: SMPTP_HOST,
    port: parseInt(SMPTP_PORT), // STARTTLS (recommended)
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const EMAIL_SUBJECT = "Daftar OS: Server Error";
const EMAIL_BODY = (userName: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Daftar OS: Server Error</h2>
  <p><strong>${userName}</strong>,</p>
  <p>We're currently experiencing server downtime. Rest assured, your data and transactions are safe, and our team is actively working to resolve the issue. We will notify you via email once the software is back up and running.</p>
  <p>Thank you for your patience.</p>
  <p>Tech Team<br/>Daftar OS</p>
</div>
`;

export async function POST() {
    let sent = 0;
    let failed: { email: string; error: string }[] = [];
    try {
        // Fetch all users
        const allUsers = await db.select().from(users);
        for (const user of allUsers) {
            if (!user.email) continue;
            try {
                await transporter.sendMail({
                    to: user.email,
                    subject: EMAIL_SUBJECT,
                    html: EMAIL_BODY(user.name || "User"),
                });
                sent++;
            } catch (err: any) {
                failed.push({ email: user.email, error: err.message || String(err) });
            }
        }
        return NextResponse.json({ success: true, sent, failed }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error), sent, failed }, { status: 500 });
    }
} 