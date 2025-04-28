import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import { sendEmail, generatePitchTeamInviteEmail, generateStandardNotificationEmail, generateActionToken } from "../notifications/listen";
import { emailTemplates } from "./insert";

type Notification = {
    id: string;
    type: string;
    role: string;
    targeted_users: string[];
    payload: {
        action?: string;
        by_user_id?: string;
        scout_id?: string;
        daftar_id?: string;
        action_by?: string;
        pitchId?: string;
        action_at?: string;
        message?: string;
        designation?: string;
        url?: string;
    };
    created_at: string;
};

export async function sendNotificationEmail(notification: Notification, userId: string) {
    try {
        // Get user's email
        const user = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user.length || !user[0].email) {
            console.error(`No email found for user ${userId}`);
            return;
        }

        const userEmail = user[0].email;

        // Get the appropriate email template based on notification type and subtype
        const typeTemplates = emailTemplates[notification.type as keyof typeof emailTemplates];
        if (!typeTemplates) {
            console.error(`No email templates found for notification type: ${notification.type}`);
            return;
        }

        // Handle different template structures
        let template;
        if (typeof typeTemplates === 'function') {
            template = typeTemplates;
        } else {
            const subtype = notification.payload.action || 'default';
            template = typeTemplates[subtype as keyof typeof typeTemplates] || 
                      (typeTemplates as any).default;
        }

        if (!template) {
            console.error(`No email template found for subtype: ${notification.payload.action}`);
            return;
        }

        if (typeof template !== 'function') {
            console.error('Template is not a function');
            return;
        }

        const emailData = (template as (notification: any, userEmail: string) => any)(notification, userEmail);
        await sendEmail(emailData);
    } catch (error) {
        console.error('Failed to send notification email:', error);
    }
} 