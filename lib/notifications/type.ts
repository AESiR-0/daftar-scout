export type NotificationType =
  | "news"
  | "updates"
  | "alert"
  | "scout_link"
  | "request";

export type NotificationRole = "founder" | "investor" | "both";

export interface NotificationPayload {
  action?: string;
  by_user_id?: string;
  scout_id?: string;
  daftar_id?: string;
  action_by?: string;
  action_at?: string;
  message?: string;
  url?: string;
}
