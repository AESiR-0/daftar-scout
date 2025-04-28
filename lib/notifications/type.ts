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
  openScoutUrl?: string;
  daftar_id?: string;
  action_by?: string;
  pitchId?: string;
  action_at?: string;
  stage?: string;
  message?: string;
  designation?: string;
  sector?: string[];
  url?: string;
  pitchName?: string;
  currentUsername?: string;
  currentUserDesignation?: string;
  invitedUsername?: string;
  invitedUserDesignation?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  joinedTime?: string;
  daftarName?: string;
  scoutName?: string;
}
