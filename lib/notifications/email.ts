import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import { sendEmail, generatePitchTeamInviteEmail, generateStandardNotificationEmail, generateActionToken } from "../notifications/listen";

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

        // Handle pitch team invite notifications
        if (notification.type === "updates" && notification.payload.pitchId) {
            const acceptToken = generateActionToken(userId, notification.payload.pitchId, 'accept');
            const rejectToken = generateActionToken(userId, notification.payload.pitchId, 'reject');

            const emailOptions = generatePitchTeamInviteEmail(
                userEmail,
                notification.payload,
                acceptToken,
                rejectToken
            );

            await sendEmail(emailOptions);
        } else {
            // Handle standard notifications
            const emailOptions = generateStandardNotificationEmail(
                userEmail,
                notification.payload
            );

            await sendEmail(emailOptions);
        }
    } catch (error) {
        console.error('Failed to send notification email:', error);
    }
} 