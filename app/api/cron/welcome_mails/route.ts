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
    const users24h = await getUsersByCreatedAt(hoursAgo24, '1');
    for (const user of users24h) {
        // Check if already sent (implement your own logic, e.g. a reminders table)
        // if (!alreadySent(user.id, "24h")) {
        await transporter.sendMail({
            to: user.email,
            subject: "Welcome! It's been 24 hours",
            html: "<p>Thanks for joining us! Here's what you can do next...</p>",
        }); await db.update(users)
            .set({ hour24Mail: true })
            .where(eq(users.id, user.id));
        // markAsSent(user.id, "24h");
        // }
    }

    // 7 day reminders
    const users7d = await getUsersByCreatedAt(daysAgo7, '7');
    for (const user of users7d) {
        // if (!alreadySent(user.id, "7d")) {
        await transporter.sendMail({
            to: user.email,
            subject: "It's been a week!",
            html: "<p>Here's how to get the most out of our platform...</p>",
        }); await db.update(users)
            .set({ day7Mail: true })
            .where(eq(users.id, user.id));
        // markAsSent(user.id, "7d");
        // }
    }
}

sendReminders().catch(console.error);