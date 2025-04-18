import { db } from "@/backend/database"; // your drizzle client
import { notifications } from "@/backend/drizzle/models/notifications"; // adjust if different
import {
  NotificationPayload,
  NotificationType,
  NotificationRole,
} from "./type";

export interface CreateNotificationInput {
  type: NotificationType;
  title?: string;
  description?: string;
  role?: NotificationRole;
  targeted_users?: string[];
  payload?: NotificationPayload;
}

export async function createNotification({
  type,
  role = "both",
  title = "",
  description = "",
  targeted_users = [],
  payload,
}: CreateNotificationInput) {
  return await db.insert(notifications).values({
    type,
    role,
    title,
    description,
    targeted_users,
    payload,
  });
}
