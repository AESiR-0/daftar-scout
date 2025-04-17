import { supabase } from "../supabase/createClient";
import { NotificationPayload } from "./type";

type Notification = {
  id: string;
  type: string;
  role: string;
  targeted_users: string[];
  payload: NotificationPayload;
  created_at: string;
};

export function listenToNotifications({
  userId,
  role,
  onNotification,
}: {
  userId: string;
  role: "founder" | "investor";
  onNotification: (notification: Notification) => void;
}) {
  return supabase
    .channel("realtime:notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        const notif = payload.new as Notification;

        const isTargeted =
          notif.targeted_users.length === 0 ||
          notif.targeted_users.includes(userId);

        const roleMatches = notif.role === "both" || notif.role === role;

        if (isTargeted && roleMatches) {
          onNotification(notif);
        }
      }
    )
    .subscribe();
}
