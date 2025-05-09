export type Role = "investor" | "founder" | "both";
export type NotificationChannel = "popup" | "mail";
export type NotificationCategory = "updates" | "alert" | "news" | "request" | "scout_link" | "none";

export interface NotificationEvent {
  key: string;
  roles: Role[];
  channels: NotificationChannel[];
  category: NotificationCategory;
  audience: string;
  description: string;
}

export const notificationEvents: NotificationEvent[] = [
  // Onboarding
  {
    key: "welcome_signup",
    roles: ["investor", "founder"],
    channels: ["mail"],
    category: "none",
    audience: "new_user",
    description: "Welcome to Daftar Operating System",
  },

  // 🔷 Daftar (Investor)
  {
    key: "daftar_invite_received",
    roles: ["investor"],
    channels: ["mail"],
    category: "none",
    audience: "invited_user",
    description: "You've been invited to join a Daftar",
  },
  {
    key: "daftar_member_added",
    roles: ["investor"],
    channels: ["popup"],
    category: "updates",
    audience: "all_daftar_members",
    description: "A new member has joined your Daftar",
  },
  {
    key: "daftar_member_removed",
    roles: ["investor"],
    channels: ["popup"],
    category: "alert",
    audience: "all_daftar_members",
    description: "A member was removed from your Daftar",
  },
  {
    key: "daftar_member_exited",
    roles: ["investor"],
    channels: ["popup", "mail"],
    category: "alert",
    audience: "all_daftar_members",
    description: "A member has exited your Daftar",
  },
  {
    key: "daftar_updated",
    roles: ["investor"],
    channels: ["popup"],
    category: "updates",
    audience: "all_daftar_members",
    description: "Daftar details were updated",
  },
  {
    key: "daftar_delete_requested",
    roles: ["investor"],
    channels: ["popup", "mail"],
    category: "alert",
    audience: "all_daftar_members",
    description: "Daftar deletion requested",
  },

  // 🟠 Scout (Investor)
  {
    key: "scout_created",
    roles: ["investor"],
    channels: ["popup", "mail"],
    category: "scout_link",
    audience: "all_scout_members",
    description: "A new scout has been created",
  },
  {
    key: "scout_collab_received",
    roles: ["investor"],
    channels: ["popup", "mail"],
    category: "request",
    audience: "invited_daftars",
    description: "You've been invited to collaborate on a scout",
  },
  {
    key: "scout_collab_sent",
    roles: ["investor"],
    channels: ["popup"],
    category: "updates",
    audience: "current_scout_members",
    description: "Scout collaboration sent",
  },
  {
    key: "scout_collab_accepted",
    roles: ["investor"],
    channels: ["popup"],
    category: "updates",
    audience: "current_scout_members",
    description: "Scout collaboration accepted",
  },
  {
    key: "scout_collab_rejected",
    roles: ["investor"],
    channels: ["popup"],
    category: "alert",
    audience: "current_scout_members",
    description: "Scout collaboration rejected",
  },
  {
    key: "scout_deleted",
    roles: ["investor", "founder"],
    channels: ["popup", "mail"],
    category: "alert",
    audience: "current_scout_members_and_related_pitch_members",
    description: "Scout deleted — pitches affected",
  },
  {
    key: "scouting_started",
    roles: ["investor"],
    channels: ["popup", "mail"],
    category: "scout_link",
    audience: "current_scout_members",
    description: "Scouting is now live",
  },
  {
    key: "scouting_closed",
    roles: ["investor"],
    channels: ["popup", "mail"],
    category: "updates",
    audience: "current_scout_members",
    description: "Startup scouting has closed",
  },

  // 🧩 Pitch (Investor & Founder)
  {
    key: "pitch_status_inbox",
    roles: ["investor"],
    channels: ["popup"],
    category: "updates",
    audience: "scout_members",
    description: "Pitch moved to inbox",
  },
  {
    key: "analysis_shared",
    roles: ["investor"],
    channels: ["popup"],
    category: "updates",
    audience: "scout_members",
    description: "An investor shared analysis",
  },
  {
    key: "doc_from_founder",
    roles: ["investor"],
    channels: ["popup"],
    category: "updates",
    audience: "scout_members",
    description: "Received document from founder",
  },
  {
    key: "doc_from_scout_to_founder",
    roles: ["founder"],
    channels: ["popup"],
    category: "updates",
    audience: "pitch_members",
    description: "Document shared from scout",
  },
  {
    key: "pitch_created",
    roles: ["founder"],
    channels: ["popup", "mail"],
    category: "updates",
    audience: "pitch_members",
    description: "New pitch created",
  },
  {
    key: "pitch_approved",
    roles: ["founder"],
    channels: ["popup"],
    category: "updates",
    audience: "pitch_members",
    description: "Pitch approved",
  },
  {
    key: "pitch_delete_requested",
    roles: ["founder"],
    channels: ["popup"],
    category: "updates",
    audience: "pitch_members",
    description: "Pitch delete request initiated",
  },
  {
    key: "pitch_deleted",
    roles: ["investor", "founder"],
    channels: ["popup", "mail"],
    category: "updates",
    audience: "pitch_members",
    description: "Pitch was deleted",
  },
  {
    key: "pitch_declined_by_investor",
    roles: ["founder"],
    channels: ["popup", "mail"],
    category: "updates",
    audience: "pitch_members",
    description: "Pitch was declined by investor",
  },

  // 💼 Offer
  {
    key: "offer_shared",
    roles: ["founder"],
    channels: ["popup", "mail"],
    category: "updates",
    audience: "pitch_members_and_related_scout_members",
    description: "Offer received from investor",
  },
  {
    key: "offer_withdrawn",
    roles: ["founder"],
    channels: ["popup"],
    category: "updates",
    audience: "pitch_members_and_related_scout_members",
    description: "Offer withdrawn by investor",
  },
  {
    key: "offer_rejected",
    roles: ["investor"],
    channels: ["popup"],
    category: "alert",
    audience: "scout_members_and_related_pitch_members",
    description: "Offer rejected by founder",
  },
  {
    key: "offer_accepted",
    roles: ["investor"],
    channels: ["popup"],
    category: "news",
    audience: "all_users",
    description: "Offer accepted by founder",
  },

  // // 🕒 Meetings (Both)
  // {
  //   key: "meeting_requested",
  //   roles: ["investor", "founder"],
  //   channels: ["popup", "mail"],
  //   category: "request",
  //   audience: "meeting_members",
  //   description: "Meeting scheduled and waiting for approval",
  // },
  // {
  //   key: "meeting_declined",
  //   roles: ["investor", "founder"],
  //   channels: ["popup", "mail"],
  //   category: "updates",
  //   audience: "meeting_members",
  //   description: "Meeting declined",
  // },
  // {
  //   key: "meeting_deleted",
  //   roles: ["investor", "founder"],
  //   channels: ["popup", "mail"],
  //   category: "updates",
  //   audience: "meeting_members",
  //   description: "Meeting deleted",
  // }
];
