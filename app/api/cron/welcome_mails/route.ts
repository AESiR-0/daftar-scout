import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq, and, gte, lte } from "drizzle-orm";
import nodemailer from "nodemailer";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const transporter = nodemailer.createTransport({
    host: "mail.smtp2go.com",
    port: 2525,
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

async function sendReminders() {
    const now = new Date();
    const hoursAgo24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const daysAgo7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Helper to get users created at a specific time window
    async function getUsersByCreatedAt(targetDate: Date, mailDay: string) {
        const column = mailDay == '1' ? users.hour24Mail : users.day7Mail
        const windowStart = new Date(targetDate.getTime() - 10 * 60 * 1000); // 10 min window
        const windowEnd = new Date(targetDate.getTime() + 10 * 60 * 1000);
        return db
            .select()
            .from(users)
            .where(and(and(gte(users.createdAt, windowStart), lte(users.createdAt, windowEnd)), eq(column, false)));
    }

    // 24 hour reminders
    // 24 hour reminders
    const users24h = await getUsersByCreatedAt(hoursAgo24, '1');
    for (const user of users24h) {
        if (user.role == 'investor' || user.role == 'Investor')
            await transporter.sendMail({
                to: user.email,
                subject: "Welcome to Daftar OS",
                html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Daftar OS</h2>
                <p><strong>${user.name}</strong></p>
                <p>I’m happy to have you with us.</p>
                <p>
                    At Daftar OS, our core vision is to help you scout startups in the simplest format and open a bigger market for investing, one you couldn’t reach before with traditional pitching formats.
                </p>
                <p>
                    So here’s to your next big opportunity, whether it’s the next Jacob’s Peanut Butter, Bose, or Manyavar – we’re working with you to help you reach them first.
                </p>
                <p>
                    You can learn more about the Daftar Operating System by experiencing it in its beta. Welcome to Daftar OS Technology.
                </p>
                <p>Raunak</p>
            </div>
        `,
            });

        else {
            await transporter.sendMail({
                to: user.email,
                subject: "Welcome to Daftar OS",
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Daftar OS</h2>
                    <p><strong>${user.name}</strong></p>
                    <p> We’re happy to have you with us.</p>
                    <p>
                                        At Daftar OS, you can pitch your startup idea in the language you are most comfortable with and get your first meeting started.

                    </p>
                    <p>
                     Welcome to Daftar OS — built by founders for founders.
                    </p>
                    
                    <p>Raunak</p>
                </div>
            `,
            });





        }

        await db.update(users)
            .set({ hour24Mail: true })
            .where(eq(users.id, user.id));
    }

    // 7 day reminders
    const users7d = await getUsersByCreatedAt(daysAgo7, '7');
    for (const user of users7d) {
        await transporter.sendMail({
            to: user.email,
            subject: "Daftar Operating System: Data Privacy",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Daftar Operating System: Data Privacy</h2>
                <p><strong>${user.name}</strong></p>
                <p>
                    At Daftar OS, your privacy is our top priority. We work around the clock to protect your personal and business information using secure technology. All your data is encrypted both during transmission and at rest, ensuring it remains safe from unauthorized access.
                </p>
                <p>
                    We believe in transparency and give you full control over your data. You can access, update, or delete your information at any time. We never sell your data to third parties and uphold strict privacy standards.
                </p>
                <p>
                    Your trust is important to us, and we are committed to keeping your data safe.
                </p>
                <p>Tech Team<br/>Daftar OS</p>
            </div>
        `,
        });
        await db.update(users)
            .set({ day7Mail: true })
            .where(eq(users.id, user.id));
    }
}

export async function GET() {
    await sendReminders().catch(console.error);
}