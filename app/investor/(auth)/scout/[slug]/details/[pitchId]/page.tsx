"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Upload, Trash2, Router, Flag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/dialogs/report-dialog";
import { ScheduleMeetingDialog } from "@/components/dialogs/schedule-meeting-dialog";
import { InvestorsNote } from "./components/investors-note";
import { DocumentsSection } from "./components/documents-section";
import { FoundersPitchSection } from "./components/founders-pitch";
import { TeamAnalysisSection } from "./components/team-analysis";
import MeetingsPage from "@/app/founder/(auth)/studio/meetings/page";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { MakeOfferSection } from "./components/make-offer-section";
import { DeclinePitchDialog } from "./components/decline-pitch-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import ApexCharts with NoSSR
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
});

/** ------------- Types -------------- **/
interface Document {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface FoundersPitch {
  status: string;
  location: string;
  sectors: string[];
  stage: string;
  questions: {
    id: number;
    question: string;
    videoUrl: string;
  }[];
}

interface Analysis {
  performanceData: number[];
  investmentDistribution: number[];
}

interface TeamAnalysis {
  id: string
  analyst: {
    name: string
    role: string
    avatar: string
    daftarName: string
  }
  belief: 'yes' | 'no'
  note: string
  date: string
}

interface Profile {
  id: string
  name: string
  role: string
  avatar: string
  daftarName: string
}

interface TeamMemberDetails {
  name: string;
  age: string;
  email: string;
  phone: string;
  gender: string;
  location: string;
  language: string[];
  imageUrl?: string;
  designation: string;
}

interface PitchDetails {
  daftarName: string;
  pitchName: string;
  status: string;
  teamMembers: TeamMemberDetails[];
  sections: {
    investorsNote: string;
    documentation: Document[];
    foundersPitch: FoundersPitch;
    analysis: Analysis;
    teamAnalysis: TeamAnalysis[]
  };
}

// const chartConfig: any = {
//   options: {
//     chart: {
//       type: "area" as any,
//       background: "transparent",
//       toolbar: { show: false }
//     },
//     stroke: {
//       curve: "smooth" as any,
//       width: 2
//     },
//     fill: {
//       type: "gradient" as any,
//       gradient: {
//         shadeIntensity: 1,
//         opacityFrom: 0.4,
//         opacityTo: 0.1,
//         stops: [0, 90, 100]
//       }
//     },
//     colors: ["#2563eb"],
//     theme: { mode: "dark" },
//     grid: { borderColor: "#334155" },
//     xaxis: {
//       categories: ["Jan", "Feb", "Mar", "Apr", "May"],
//       labels: { style: { colors: "#94a3b8" } }
//     },
//     yaxis: {
//       labels: { style: { colors: "#94a3b8" } }
//     }
//   }
// };

const sections = [
  { id: "founders-pitch", label: "Founder's Pitch" },
  { id: "team-size", label: "Team Size" },
  { id: "team-analysis", label: "Team's Analysis" },
  { id: "investors-note", label: "Investor's Note" },
  { id: "documents", label: "Documents" },
  { id: "meetings", label: "Meetings" },
  { id: "make-offer", label: "Make an Offer" },
] as const;

/** ------------- Main Component -------------- **/
export default function PitchDetailsPage() {
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState("investors-note");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [pitchDetails, setPitchDetails] = useState<PitchDetails>({
    daftarName: "Tech Startup",
    pitchName: "AI Chatbot",
    status: "In Review",
    teamMembers: [
      {
        name: "Alex Johnson",
        age: "25",
        email: "alex@example.com",
        phone: "1234567890",
        gender: "Male",
        location: "New York, NY",
        language: ["English", "Hindi"],
        imageUrl: "https://example.com/alex.jpg",
        designation: "Chief Technology Officer"
      },
      {
        name: "Emily Smith",
        age: "28",
        email: "emily@example.com",
        phone: "9876543210",
        gender: "Female",
        location: "San Francisco, CA",
        language: ["English", "Spanish"],
        imageUrl: "https://example.com/emily.jpg",
        designation: "Product Manager"
      }
    ],
    sections: {
      investorsNote: "This is a promising startup with great potential...",
      documentation: [
        { id: "1", name: "Financial_Model.xlsx", uploadedBy: "John Doe", uploadedAt: "2024-03-20" },
        { id: "2", name: "Pitch_Deck.pdf", uploadedBy: "Sarah Smith", uploadedAt: "2024-03-19" },
      ],
      foundersPitch: {
        status: "Under Review",
        location: "Dubai, UAE",
        stage: "Seed",
        sectors: ["AI/ML", "SaaS"],
        questions: [
          {
            id: 1,
            question: "What inspired you to start this venture?",
            videoUrl: "https://example.com/video1"
          },
          {
            id: 2,
            question: "What problem are you solving and for whom?",
            videoUrl: "https://example.com/video2"
          },
          {
            id: 3,
            question: "What's your unique value proposition?",
            videoUrl: "https://example.com/video3"
          },
          {
            id: 4,
            question: "Who are your competitors and what's your advantage?",
            videoUrl: "https://example.com/video4"
          },
          {
            id: 5,
            question: "What's your business model and go-to-market strategy?",
            videoUrl: "https://example.com/video5"
          },
          {
            id: 6,
            question: "What are your funding requirements and use of funds?",
            videoUrl: "https://example.com/video6"
          }
        ]
      },
      analysis: {
        performanceData: [45, 52, 38, 65, 78],
        investmentDistribution: [30, 25, 20, 15, 10]
      },
      teamAnalysis: [
        {
          id: '1',
          analyst: {
            name: 'Sarah Johnson',
            role: 'Investment Analyst',
            avatar: '/avatars/sarah.jpg',
            daftarName: 'Tech Startup'
          },
          belief: 'yes',
          note: '<p>The team has shown exceptional capability...</p>',
          date: '2024-03-20T10:00:00Z'
        },
        {
          id: '2',
          analyst: {
            name: 'Mike Wilson',
            role: 'Senior Scout',
            avatar: '/avatars/mike.jpg',
            daftarName: 'Tech Startup'
          },
          belief: 'no',
          note: '<p>While the idea is promising, I have concerns about...</p>',
          date: '2024-03-19T15:30:00Z'
        }
      ]
    }
  });
  const params = useParams();
  const router = useRouter();

  // Add current profile (this could come from your auth context)
  const currentProfile = {
    id: 'current-user',
    name: 'Current User',
    role: 'Investment Analyst',
    avatar: '/avatars/current-user.jpg',
    daftarName: 'Tech Startup'
  }

  const handleSubmitAnalysis = async (data: {
    belief: 'yes' | 'no'
    note: string | undefined
    analyst: Profile
  }) => {
    try {
      // Add your API call here
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchId: params.pitchId,
          ...data
        })
      })

      if (!response.ok) throw new Error('Failed to submit analysis')

      // Update local state
      const newAnalysis: TeamAnalysis = {
        id: Date.now().toString(),
        belief: data.belief,
        note: data.note || '',
        analyst: data.analyst,
        date: new Date().toISOString()
      }

      setPitchDetails(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          teamAnalysis: [newAnalysis, ...prev.sections.teamAnalysis]
        }
      }))

      // Show success toast
    } catch (error) {
      // Show error toast
      console.error(error)
    }
  }

  const handleUploadDocument = async (file: File) => {
    try {
      // Add your file upload logic here
      // Example:
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pitchId', params.pitchId as string)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      // Update local state
      const newDoc = await response.json()
      setPitchDetails(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          documentation: [newDoc, ...prev.sections.documentation]
        }
      }))
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      // Add your delete logic here
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Delete failed')

      // Update local state
      setPitchDetails(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          documentation: prev.sections.documentation.filter(doc => doc.id !== id)
        }
      }))
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const handleMakeOffer = async (offerContent: string) => {
    try {
      // Add your API call here
      await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchId: params.pitchId,
          content: offerContent
        })
      });

      toast({
        title: "Success",
        description: "Offer sent successfully",
        variant: "success",
      });

      router.push("/investor/scout");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send offer. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleDeclinePitch = async (reason: string) => {
    try {
      // Add your API call here
      await fetch('/api/pitches/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchId: params.pitchId,
          reason
        })
      });

      toast({
        title: "Success",
        description: "Pitch declined successfully",
        variant: "success",
      });

      router.push("/investor/scout");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline pitch. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  // Add helper function for initials
  const getInitials = (name: string) => {
    const words = name.split(' ');
    return words.length > 1 ? words[0][0] + words[1][0] : name[0];
  };

  // Add this helper function near the getInitials function
  const formatLanguages = (languages: string[]) => {
    if (languages.length === 0) return '';
    if (languages.length === 1) return languages[0];
    if (languages.length === 2) return `${languages[0]} and ${languages[1]}`;

    const lastLanguage = languages[languages.length - 1];
    const otherLanguages = languages.slice(0, -1).join(', ');
    return `${otherLanguages} and ${lastLanguage}`;
  };

  return (
    <ScrollArea className="h-[calc(100vh-6rem)]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-border py-5">
          <div className="flex gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                className={cn(
                  "text-sm font-medium",
                  activeSection === section.id && "bg-[#1f1f1f]"
                )}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setReportDialogOpen(true)}
            >
              <Flag className="h-4 w-4 " />
            </Button>

          </div>
          <ReportDialog
            open={reportDialogOpen}
            onOpenChange={setReportDialogOpen}
          />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeSection === "investors-note" && (
            <InvestorsNote note={pitchDetails.sections.investorsNote} />
          )}
          {activeSection === "documents" && (
            <DocumentsSection
            />
          )}
          {activeSection === "team-size" && (
            <div className="space-y-6">
              <Card className="border-none bg-[#0e0e0e]">
                <CardHeader>
                  <CardTitle>Team Members ({pitchDetails.teamMembers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {pitchDetails.teamMembers.map((member) => (
                      <div key={member.email} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 text-xl">
                            {member.imageUrl ? (
                              <AvatarImage src={member.imageUrl} alt={member.name} />
                            ) : (
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <h4 className="text-lg font-medium">{member.name}</h4>
                            <p className="text-sm text-blue-500">{member.designation}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>{member.age} years</span>
                              <span>{member.gender}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Contact</p>
                            <p>{member.email}</p>
                            <p>{member.phone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p>{member.location}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Preferred Languages
                          </p>
                          <p className="text-sm">
                            {formatLanguages(member.language)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {activeSection === "meetings" && (
            <MeetingsPage />
          )}
          {activeSection === "founders-pitch" && (
            <FoundersPitchSection
              pitch={pitchDetails.sections.foundersPitch}
              onScheduleMeeting={() => setScheduleMeetingOpen(true)}
            />
          )}
          {activeSection === "team-analysis" && (
            <TeamAnalysisSection
              teamAnalysis={pitchDetails.sections.teamAnalysis}
              currentProfile={currentProfile}
              onSubmitAnalysis={handleSubmitAnalysis}
            />
          )}
          {activeSection === "make-offer" && (
            <MakeOfferSection />
          )}
        </div>
      </div>

      {/* Dialogs */}

      <ScheduleMeetingDialog
        open={scheduleMeetingOpen}
        onOpenChange={setScheduleMeetingOpen}
      />
      <DeclinePitchDialog
        open={declineDialogOpen}
        onOpenChange={setDeclineDialogOpen}
        onDecline={handleDeclinePitch}
      />
    </ScrollArea>
  );
}
