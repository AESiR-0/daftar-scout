export type NotificationType =
  | "news"
  | "updates"
  | "alert"
  | "scout_link"
  | "request"
  | "welcome";

export type NotificationRole = "founder" | "investor" | "both";

export interface NotificationPayload {
  userName?: string;
  daftarName?: string;
  pitchId?: string;
  pitchName?: string;
  scoutId?: string;
  scoutName?: string;
  currentUsername?: string;
  currentUserDesignation?: string;
  invitedUsername?: string;
  invitedUserDesignation?: string;
  designation?: string;
  joinedTime?: string;
  openScoutUrl?: string;
  message?: string;
  url?: string;
  action_by?: string;
  documentName?: string;
  founderName?: string;
  location?: string;
  sector?: string;
  stage?: string;
  [key: string]: any; // Allow for additional properties
}
