"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/dialogs/report-dialog";
import { ScheduleMeetingDialog } from "@/components/dialogs/schedule-meeting-dialog";
import { InvestorsNote } from "./components/investors-note";
import DocumentsSection from "./components/documents-section";
import { FoundersPitchSection } from "./components/founders-pitch";
import { TeamAnalysisSection } from "./components/team-analysis";
import MeetingsPage from "@/app/founder/(auth)/[pitchId]/studio/meetings/page";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { MakeOfferSection } from "./components/make-offer-section";
import { DeclinePitchDialog } from "./components/decline-pitch-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PieChart } from "@/components/ui/charts";

// Import ApexCharts with NoSSR
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
  ),
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
  id: string;
  analyst: {
    name: string;
    role: string;
    avatar: string;
    daftarName: string;
  };
  belief: "yes" | "no";
  note: string;
  nps: number;
  date: string;
}

interface Profile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  daftarName: string;
}

interface TeamMemberDetails {
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  phone: string;
  gender: string;
  location: string;
  language: string[];
  imageUrl?: string;
  designation: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  imageUrl?: string;
  designation: string;
  language: string[];
  age: string;
  gender: string;
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
    teamAnalysis: TeamAnalysis[];
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
  { id: "founders-team", label: "Founder's Team" },
  { id: "investors-analysis", label: "Investor's Analysis" },
  { id: "investors-note", label: "Investor's Note" },
  { id: "documents", label: "Documents" },
  { id: "make-offer", label: "Offer" },
] as const;

const formatPhoneNumber = (phone: string) => {
  // Match country code (anything from start until last 10 digits)
  const match = phone.match(/^(.+?)(\d{10})$/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return phone;
};
const getInitials = (name: string) => {
  const [firstName, lastName] = name.split(" ");
  return firstName?.[0] + (lastName?.[0] || "");
};
const MemberCard = ({ member }: { member: TeamMember }) => (
  <div className="bg-[#1a1a1a] p-6 rounded-[0.35rem]">
    <div className="flex justify-between items-start">
      <div className="gap-4">
        <Avatar className="h-56 w-56 rounded-[0.35rem]">
          {member.imageUrl ? (
            <AvatarImage
              src={member.imageUrl}
              alt={member.firstName}
              className="rounded-[0.35rem]"
            />
          ) : (
            <AvatarFallback className="rounded-[0.35rem] text-xl">
              {getInitials(member.firstName)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xl font-medium">
              {member.firstName} {member.lastName}
            </h4>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            {member.designation}
          </p>

          <div className="">
            <div className="space-y-1 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{member.age}</span>
                <span>{member.gender}</span>
              </div>
              <div className="flex items-center gap-2">
                <p>{member.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <p>{formatPhoneNumber(member.phone)}</p>
              </div>
              <div className="flex items-center gap-2">
                <p>{member.location}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Preferred languages to connect with investors:{" "}
                {member.language.join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/** ------------- Main Component -------------- **/
export default function PitchDetailsPage() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("founders-pitch");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [pitchDetails, setPitchDetails] = useState<PitchDetails>({
    daftarName: "Tech Startup",
    pitchName: "AI Chatbot",
    status: "In Review",
    teamMembers: [
      {
        firstName: "Alex",
        lastName: "Johnson",
        age: "25",
        email: "alex@example.com",
        phone: "1234567890",
        gender: "Male",
        location: "New York, NY",
        language: ["English", "Hindi"],
        imageUrl: "https://github.com/shadcn.png",
        designation: "Chief Technology Officer",
      },
      {
        firstName: "Emily",
        lastName: "Smith",
        age: "28",
        email: "emily@example.com",
        phone: "9876543210",
        gender: "Female",
        location: "San Francisco, CA",
        language: ["English", "Spanish"],
        imageUrl: "https://github.com/shadcn.png",
        designation: "Product Manager",
      },
    ],
    sections: {
      investorsNote: "This is a promising startup with great potential...",
      documentation: [
        {
          id: "1",
          name: "Financial_Model.xlsx",
          uploadedBy: "John Doe",
          uploadedAt: "2024-03-20",
        },
        {
          id: "2",
          name: "Pitch_Deck.pdf",
          uploadedBy: "Sarah Smith",
          uploadedAt: "2024-03-19",
        },
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
            videoUrl: "https://example.com/video1",
          },
          {
            id: 2,
            question: "What problem are you solving and for whom?",
            videoUrl: "https://example.com/video2",
          },
          {
            id: 3,
            question: "What's your unique value proposition?",
            videoUrl: "https://example.com/video3",
          },
          {
            id: 4,
            question: "Who are your competitors and what's your advantage?",
            videoUrl: "https://example.com/video4",
          },
          {
            id: 5,
            question: "What's your business model and go-to-market strategy?",
            videoUrl: "https://example.com/video5",
          },
          {
            id: 6,
            question: "What are your funding requirements and use of funds?",
            videoUrl: "https://example.com/video6",
          },
        ],
      },
      analysis: {
        performanceData: [45, 52, 38, 65, 78],
        investmentDistribution: [30, 25, 20, 15, 10],
      },
      teamAnalysis: [
        {
          id: "1",
          analyst: {
            name: "Sarah Johnson",
            role: "Investment Analyst",
            avatar: "/avatars/sarah.jpg",
            daftarName: "Tech Startup",
          },
          belief: "yes",
          note: "<p>The team has shown exceptional capability...</p>",
          date: "2024-03-20T10:00:00Z",
          nps: 5,
        },
        {
          id: "2",
          analyst: {
            name: "Mike Wilson",
            role: "Senior Scout",
            avatar: "/avatars/mike.jpg",
            daftarName: "Tech Startup",
          },
          belief: "no",
          note: "<p>While the idea is promising, I have concerns about...</p>",
          date: "2024-03-19T15:30:00Z",
          nps: 3,
        },
      ],
    },
  });
  const params = useParams();
  const router = useRouter();

  // Add current profile (this could come from your auth context)
  const currentProfile = {
    id: "current-user",
    name: "Current User",
    role: "Investment Analyst",
    avatar: "/avatars/current-user.jpg",
    daftarName: "Tech Startup",
  };

  const handleSubmitAnalysis = async (data: {
    belief: "yes" | "no";
    note: string | undefined;
    analyst: Profile;
    nps: number | null;
  }) => {
    try {
      // Add your API call here
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId: params.pitchId,
          ...data,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit analysis");

      // Update local state
      const newAnalysis: TeamAnalysis = {
        id: Date.now().toString(),
        belief: data.belief,
        note: data.note || "",
        analyst: data.analyst,
        date: new Date().toISOString(),
        nps: data.nps || 0,
      };

      setPitchDetails((prev) => ({
        ...prev,
        sections: {
          ...prev.sections,
          teamAnalysis: [newAnalysis, ...prev.sections.teamAnalysis],
        },
      }));

      // Show success toast
    } catch (error) {
      // Show error toast
      console.error(error);
    }
  };

  const handleUploadDocument = async (file: File) => {
    try {
      // Add your file upload logic here
      // Example:
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pitchId", params.pitchId as string);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      // Update local state
      const newDoc = await response.json();
      setPitchDetails((prev) => ({
        ...prev,
        sections: {
          ...prev.sections,
          documentation: [newDoc, ...prev.sections.documentation],
        },
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      // Add your delete logic here
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      // Update local state
      setPitchDetails((prev) => ({
        ...prev,
        sections: {
          ...prev.sections,
          documentation: prev.sections.documentation.filter(
            (doc) => doc.id !== id
          ),
        },
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleMakeOffer = async (offerContent: string) => {
    try {
      // Add your API call here
      await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId: params.pitchId,
          content: offerContent,
        }),
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
      await fetch("/api/pitches/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId: params.pitchId,
          reason,
        }),
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
    const words = name.split(" ");
    return words.length > 1 ? words[0][0] + words[1][0] : name[0];
  };

  // Add this helper function near the getInitials function
  const formatLanguages = (languages: string[]) => {
    if (languages.length === 0) return "";
    if (languages.length === 1) return languages[0];
    if (languages.length === 2) return `${languages[0]} and ${languages[1]}`;

    const lastLanguage = languages[languages.length - 1];
    const otherLanguages = languages.slice(0, -1).join(", ");
    return `${otherLanguages} and ${lastLanguage}`;
  };

  // Add this helper function to process data for charts
  const processTeamData = () => {
    const ageData = pitchDetails.teamMembers.map((member) => ({
      x: member.firstName,
      y: parseInt(member.age),
    }));

    const genderCount = pitchDetails.teamMembers.reduce((acc, member) => {
      acc[member.gender] = (acc[member.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const languageCount = pitchDetails.teamMembers.reduce((acc, member) => {
      member.language.forEach((lang) => {
        acc[lang] = (acc[lang] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const averageAge =
      pitchDetails.teamMembers.reduce(
        (sum, member) => sum + parseInt(member.age),
        0
      ) / pitchDetails.teamMembers.length;

    return {
      ageData,
      genderData: Object.entries(genderCount).map(([name, value]) => ({
        name,
        value,
      })),
      languageData: Object.entries(languageCount),
      averageAge,
    };
  };

  const { ageData, genderData, languageData, averageAge } = processTeamData();

  return (
    <ScrollArea className="h-[calc(100vh-6rem)]">
      {/* Navigation */}
      <div className="flex justify-between items-center border-b border-border py-2 px-4">
        <div className="flex gap-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "relative px-3 py-2 text-sm transition-colors",
                activeSection === section.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                "group"
              )}
            >
              {section.label}
              <span
                className={cn(
                  "absolute inset-x-0 -bottom-[10px] h-[2px] transition-opacity rounded-[035rem]",
                  activeSection === section.id
                    ? "bg-foreground opacity-100"
                    : "bg-foreground opacity-0 group-hover:opacity-100"
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2 mr-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReportDialogOpen(true)}
          >
            Report
          </Button>
        </div>
        <ReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
        />
      </div>
      <div className="container mx-auto">
        {/* Content */}
        <div className="mt-10">
          {activeSection === "investors-note" && (
            <InvestorsNote note={pitchDetails.sections.investorsNote} />
          )}
          {activeSection === "documents" && <DocumentsSection />}
          {activeSection === "founders-team" && (
            <div className="space-y-6">
              <Card className="border-none bg-[#0e0e0e]">
                <CardContent>
                  <div className="flex gap-8">
                    {/* Left column - Member Cards */}
                    <div className="w-[25%] space-y-2">
                      {pitchDetails.teamMembers.map((member) => {
                        const transformedMember: TeamMember = {
                          id: member.firstName,
                          firstName: member.firstName,
                          lastName: member.lastName,
                          email: member.email,
                          phone: member.phone,
                          location: member.location,
                          imageUrl: member.imageUrl,
                          designation: member.designation,
                          language: member.language,
                          age: member.age,
                          gender: member.gender,
                        };
                        return (
                          <MemberCard
                            key={member.firstName}
                            member={transformedMember}
                          />
                        );
                      })}
                    </div>

                    {/* Middle column - Charts */}
                    <div className="w-[45%] space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Team Members ({pitchDetails.teamMembers.length}) |{" "}
                          <span className="text-muted-foreground">
                            Average Age: {averageAge}
                          </span>
                        </h3>

                        <div className="space-y-6 ">
                          {/* Age Line Chart */}
                          {/* <Card className="border-none bg-[#1a1a1a] p-4">
                            <h4 className="text-sm font-medium mb-2">Age Distribution</h4>
                            <div className="h-[200px]">
                              <LineChart 
                                data={ageData}
                                categories={['Age']}
                              />
                            </div>
                          </Card> */}

                          {/* Gender Pie Chart */}
                          <Card className="border-none bg-[#1a1a1a] p-4">
                            <h4 className="text-sm font-medium mb-2">
                              Gender Ratio
                            </h4>
                            <div className="h-[200px]">
                              <PieChart data={genderData} />
                            </div>
                          </Card>
                        </div>
                      </div>
                    </div>

                    {/* Right column - Languages */}
                    <div className="w-[30%] mt-11">
                      <Card className="border-none bg-[#1a1a1a] p-4">
                        <h4 className="text-sm font-medium mb-4">
                          Preferred Languages to Connect with Investors
                        </h4>
                        <div className="space-y-2">
                          {languageData.map(([language, count]) => (
                            <div
                              key={language}
                              className="flex items-center justify-between p-2 rounded-md bg-background"
                            >
                              <span className="text-sm">{language}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {activeSection === "meetings" && <MeetingsPage />}
          {activeSection === "founders-pitch" && (
            <FoundersPitchSection
              pitch={pitchDetails.sections.foundersPitch}
              onScheduleMeeting={() => setScheduleMeetingOpen(true)}
            />
          )}
          {activeSection === "investors-analysis" && (
            <TeamAnalysisSection
              teamAnalysis={pitchDetails.sections.teamAnalysis}
              currentProfile={currentProfile}
              onSubmitAnalysis={handleSubmitAnalysis}
            />
          )}
          {activeSection === "make-offer" && <MakeOfferSection />}
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
