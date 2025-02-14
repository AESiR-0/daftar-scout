import { LayoutDashboard, Users, DollarSign, Building, Play, ScrollText, Folder, Bell, Calendar, Crown, FileText, Video, MessageCircle, HelpCircle, UserPlus, Trash2, FileSpreadsheet, Users2, CheckCircle, Presentation } from "lucide-react"

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
  {
    title: "Meetings",
    url: "/investor/meetings",
    icon: Calendar,
  },
  {
    title: "Go Premium",
    url: "/investor/premium",
    icon: Crown,
  }
]


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
]

export const topNavConfig = {
  investor: [
    { text: 'Journal', action: 'journal' },
    { text: 'Subscription', action: 'subscription' }
  ],
  founder: [
    { text: 'Journal', action: 'journal' },
    { text: 'Subscription', action: 'subscription' },
    { icon: Play, action: 'play' },
    { icon: Bell, action: 'notifications' },
  ]
}

export const investorStudioNavItems = [
  {
    title: "Scout Details",
    url: "/investor/studio/details",
    icon: FileSpreadsheet,
  },
  {
    title: "Collaboration",
    url: "/investor/studio/collaboration",
    icon: Users2,
  },
  {
    title: "Scout Document",
    url: "/investor/studio/documents",
    icon: FileText,
  },
  {
    title: "Audience",
    url: "/investor/studio/audience",
    icon: Users,
  },
  {
    title: "Founder's Pitch",
    url: "/investor/studio/founder-pitch",
    icon: Video,
  },
  {
    title: "Investor's Pitch",
    url: "/investor/studio/investor-pitch",
    icon: MessageCircle,
  },
  {
    title: "FAQs",
    url: "/investor/studio/faqs",
    icon: HelpCircle,
  },
  {
    title: "Invite from Database",
    url: "/investor/studio/invite",
    icon: UserPlus,
  },
  {
    title: "Approval",
    url: "/investor/studio/approval",
    icon: CheckCircle,
  },
  {
    title: "Meetings",
    url: "/investor/studio/meetings",
    icon: Calendar,
  },
  {
    title: "Schedule",
    url: "/investor/studio/schedule",
    icon: Calendar,
  },
  {
    title: "Delete",
    url: "/investor/studio/delete",
    icon: Trash2,
    className: "text-red-500 hover:text-red-600",
  },
]

export const founderStudioNavItems = [
  {
    title: "Scout Details",
    url: "/founder/studio/scout-details",
    icon: FileSpreadsheet,
  },
  {
    title: "Pitch Name",
    url: "/founder/studio/pitch-name",
    icon: FileText,
  },
  {
    title: "Team",
    url: "/founder/studio/team",
    icon: Users2,
  },
  {
    title: "Investor's Questions",
    url: "/founder/studio/investor-questions",
    icon: HelpCircle,
  },
  {
    title: "Pitch",
    url: "/founder/studio/pitch",
    icon: Video,
  },
  {
    title: "Documents",
    url: "/founder/studio/documents",
    icon: Folder,
    subItems: [
      {
        title: "Private",
        url: "/founder/studio/documents/private",
      },
      {
        title: "Received",
        url: "/founder/studio/documents/received",
      },
      {
        title: "Sent",
        url: "/founder/studio/documents/sent",
      }
    ]
  },
  {
    title: "Offer",
    url: "/founder/studio/offer",
    icon: FileSpreadsheet,
  },
  {
    title: "Insights",
    url: "/founder/studio/insights",
    icon: FileSpreadsheet,
  },
  {
    title: "Bill",
    url: "/founder/studio/bill",
    icon: FileSpreadsheet,
  },
  {
    title: "Delete",
    url: "/founder/studio/delete",
    icon: Trash2,
    className: "text-red-500 hover:text-red-600",
  },
] 