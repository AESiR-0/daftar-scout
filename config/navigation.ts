import {
  LayoutDashboard,
  Users,
  DollarSign,
  Building,
  Play,
  ScrollText,
  Folder,
  Bell,
  Calendar,
  Crown,
  FileText,
  Video,
  MessageCircle,
  HelpCircle,
  UserPlus,
  Trash2,
  FileSpreadsheet,
  Users2,
  CheckCircle,
  Presentation,
} from "lucide-react";

export const investorNavItems = [
  // {
  //   title: "Dashboard",
  //   url: "/dashboard",
  //   icon: LayoutDashboard,
  // },
  {
    title: "Scout",
    url: "/investor/scout",
    icon: Users,
  },
  // {
  //   title: "Meetings",
  //   url: "/investor/meetings",
  //   icon: Calendar,
  // },
  // {
  //   title: "Go Premium",
  //   url: "/investor/premium",
  //   icon: Crown,
  // }
];

export const founderNavItems = [
  // {
  //   title: "Dashboard",
  //   url: "/dashboard",
  //   icon: LayoutDashboard,
  // },
  {
    title: "Pitch",
    url: "/founder/pitch",
    icon: Building,
  },
  // {
  //   title: "My Daftar",
  //   url: "/founder/daftar",
  //   icon: DollarSign,
  // },
  // {
  //   title: "Meetings",
  //   url: "/founder/meetings",
  //   icon: Calendar,
  // },
  // {
  //   title: "Go Premium",
  //   url: "/founder/premium",
  //   icon: Crown,
  // }
];

export const topNavConfig = {
  investor: [
    { text: "Journal", action: "journal" },
    { text: "Subscription", action: "subscription" },
    { icon: Play, action: "play" },
    { icon: Bell, action: "notifications" },
    { icon: Folder, action: "daftar" },
  ],
  founder: [
    { text: "Journal", action: "journal" },
    { text: "Subscription", action: "subscription" },
    { icon: Play, action: "play" },
    { icon: Bell, action: "notifications" },
  ],
};

export const investorStudioNavItems = [
  {
    title: "Scout Details",
    url: "details",
    icon: FileSpreadsheet,
  },
  {
    title: "Audience",
    url: "audience",
    icon: Users,
  },
  {
    title: "Collaboration",
    url: "collaboration",
    icon: Users2,
  },
  {
    title: "Scout Document",
    url: "documents",
    icon: FileText,
  },
  {
    title: "Founder's Pitch",
    url: "founder-pitch",
    icon: Video,
  },
  {
    title: "Investor's Pitch",
    url: "investor-pitch",
    icon: MessageCircle,
  },
  {
    title: "FAQs",
    url: "faqs",
    icon: HelpCircle,
  },
  // {
  //   title: "Invite from Database",
  //   url: "/investor/studio/invite",
  //   icon: UserPlus,
  // },
  {
    title: "Approval",
    url: "approval",
    icon: CheckCircle,
  },
  // {
  //   title: "Meetings",
  //   url: "meetings",
  //   icon: Calendar,
  // },
  {
    title: "Schedule",
    url: "schedule",
    icon: Calendar,
  },

  {
    title: "Delete",
    url: "delete",
    icon: Trash2,
    className: "text-red-500 hover:text-red-600",
  },
];

export const scoutStudioNavItems = [
  {
    title: "Scout Details",
    url: "/investor/scout/random/details/studio/details",
    icon: FileSpreadsheet,
  },
  {
    title: "Audience",
    url: "/investor/scout/random/details/studio/audience",
    icon: Users,
  },
  {
    title: "Collaboration",
    url: "/investor/scout/random/details/studio/collaboration",
    icon: Users2,
  },
  {
    title: "Scout Document",
    url: "/investor/scout/random/details/studio/documents",
    icon: FileText,
  },
  {
    title: "Founder's Pitch",
    url: "/investor/scout/random/details/studio/founder-pitch",
    icon: Video,
  },
  {
    title: "Investor's Pitch",
    url: "/investor/scout/random/details/studio/investor-pitch",
    icon: MessageCircle,
  },
  {
    title: "FAQs",
    url: "/investor/scout/random/details/studio/faqs",
    icon: HelpCircle,
  },
  // {
  //   title: "Invite from Database",
  //   url: "/investor/studio/invite",
  //   icon: UserPlus,
  // },
  {
    title: "Approval",
    url: "/investor/scout/random/details/studio/approval",
    icon: CheckCircle,
  },
  // {
  //   title: "Meetings",
  //   url: "/investor/studio/meetings",
  //   icon: Calendar,
  // },
  {
    title: "Schedule",
    url: "/investor/scout/random/details/studio/schedule",
    icon: Calendar,
  },
  {
    title: "Delete",
    url: "/investor/scout/random/details/studio/delete",
    icon: Trash2,
    className: "text-red-500 hover:text-red-600",
  },
];

export const founderStudioNavItems = [
  {
    title: "Scout Details",
    url: "scout-details",
    icon: FileSpreadsheet,
  },
  {
    title: "Pitch Name",
    url: "pitch-name",
    icon: FileText,
  },
  {
    title: "Team",
    url: "team",
    icon: Users2,
  },
  {
    title: "Investor's Questions",
    url: "investor-questions",
    icon: HelpCircle,
  },
  {
    title: "Pitch",
    url: "pitch",
    icon: Video,
  },
  {
    title: "Documents",
    url: "documents",
    icon: Folder,
    subItems: [
      {
        title: "Private",
        url: "documents/private",
      },
      {
        title: "Received",
        url: "documents/received",
      },
      {
        title: "Sent",
        url: "documents/sent",
      },
    ],
  },
  {
    title: "Offer",
    url: "offer",
    icon: FileSpreadsheet,
  },
  // {
  //   title: "Insights",
  //   url: "/founder/studio/insights",
  //   icon: FileSpreadsheet,
  // },
  // {
  //   title: "Bill",
  //   url: "/founder/studio/bill",
  //   icon: FileSpreadsheet,
  // },
  {
    title: "Delete",
    url: "/founder/studio/delete",
    icon: Trash2,
    className: "text-red-500 hover:text-red-600",
  },
];
