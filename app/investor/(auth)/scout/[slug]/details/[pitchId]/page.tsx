"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
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
import { useParams, usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { MakeOfferSection } from "./components/make-offer-section";
import { DeclinePitchDialog } from "./components/decline-pitch-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PieChart } from "@/components/ui/charts";
import { Loader2 } from "lucide-react";
import { useDaftar } from "@/lib/context/daftar-context";

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
  daftar: string;
  scoutName: string;
  uploadedAt: string;
  type: "private" | "received" | "sent";
  size: string;
  logs?: {
    action: string;
    timestamp: string;
    user: string;
  }[];
  isHidden?: boolean;
}

interface Question {
  id: number;
  question: string;
  videoUrl: string;
}

interface FoundersPitch {
  status: string;
  location: string;
  sectors: string[];
  stage: string;
  ask: string;
  demoLink: string;
  questions: Question[];
}

interface Analysis {
  performanceData: number[];
  investmentDistribution: number[];
}

interface TeamAnalysis {
  id: string;
  analyst: {
    id: string;
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
  id: string;
  daftarName: string;
  pitchName: string;
  status: string;
  teamMembers: TeamMemberDetails[];
  fields: {
    investorsNote: string;
    documentation: Document[];
    foundersPitch: FoundersPitch;
    analysis: Analysis;
    teamAnalysis: TeamAnalysis[];
  };
}

const fields = [
  { id: "founders-pitch", label: "Founder's Pitch" },
  { id: "founders-team", label: "Founder's Team" },
  { id: "investors-analysis", label: "Investor's Analysis" },
  { id: "investors-note", label: "Investor's Note" },
  { id: "documents", label: "Documents" },
  { id: "make-offer", label: "Offer" },
] as const;

const formatPhoneNumber = (phone: string) => {
  if (!phone) return "";
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
              {getInitials(`${member.firstName} ${member.lastName}`)}
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
                Preferred languages to connect with investors: <br />
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
  const { selectedDaftar, isLoading: isDaftarLoading } = useDaftar();
  const [activeSection, setActiveSection] = useState("founders-pitch");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [pitchDetails, setPitchDetails] = useState<PitchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const pitchId = pathname.split("/")[5];
  const scoutId = pathname.split("/")[3];
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (isDaftarLoading) return; // Don't fetch if daftar context is still loading
      try {
        const [userIdResponse, userInfoResponse] = await Promise.all([
          fetch("/api/endpoints/users/getId"),
          fetch("/api/endpoints/users/me")
        ]);

        if (!userIdResponse.ok || !userInfoResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const { id } = await userIdResponse.json();
        const userInfo = await userInfoResponse.json();

        setUserId(id);
        setCurrentProfile({
          id,
          name: userInfo.name,
          role: userInfo.role,
          avatar: userInfo.avatar || "/avatars/default.jpg",
          daftarName: userInfo.daftarName,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [isDaftarLoading, toast]);

  // Fetch pitch details
  useEffect(() => {
    const fetchPitch = async () => {
      if (isDaftarLoading || !selectedDaftar) return; // Don't fetch if daftar context is still loading
      setLoading(true);
      try {
        const [pitchResponse, analysisResponse] = await Promise.all([
          fetch(`/api/endpoints/pitch/investor?pitchId=${pitchId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`/api/endpoints/pitch/investor/analysis?scoutId=${scoutId}&pitchId=${pitchId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
        ]);

        if (!pitchResponse.ok) {
          const errorData = await pitchResponse.json();
          throw new Error(errorData.error || "Failed to fetch pitch");
        }

        const pitchData: PitchDetails = await pitchResponse.json();
        const analysisData = analysisResponse.ok ? await analysisResponse.json() : { analysis: [] };

        // Merge the data
        const mergedData = {
          ...pitchData,
          fields: {
            ...pitchData.fields,
            teamAnalysis: analysisData.analysis || []
          }
        };

        console.log("Fetched pitch details:", mergedData);
        setPitchDetails(mergedData);
      } catch (err) {
        setError((err as Error).message);
        toast({
          title: "Error",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPitch();
  }, [params.pitchId, toast]);
  console.log(userId, "user");

  const handleSubmitAnalysis = async (data: {
    belief: "yes" | "no";
    note: string | undefined;
    analyst: Profile;
    nps: number | null;
  }) => {
    try {
      const response = await fetch(`/api/endpoints/pitch/investor/analysis?scoutId=${scoutId}&pitchId=${pitchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: data.note,
          believeRating: data.nps,
          shouldMeet: data.belief === "yes"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit analysis");
      }

      const newAnalysis: TeamAnalysis = {
        id: Date.now().toString(),
        belief: data.belief,
        note: data.note || "",
        analyst: data.analyst,
        date: new Date().toISOString(),
        nps: data.nps || 0,
      };

      setPitchDetails((prev) =>
        prev
          ? {
              ...prev,
              fields: {
                ...prev.fields,
                teamAnalysis: [newAnalysis, ...prev.fields.teamAnalysis],
              },
            }
          : prev
      );

      toast({
        title: "Success",
        description: "Analysis submitted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error submitting analysis:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit analysis",
        variant: "destructive",
      });
    }
  };

  const handleUploadDocument = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pitchId", params.pitchId as string);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const newDoc = await response.json();
      setPitchDetails((prev) =>
        prev
          ? {
              ...prev,
              fields: {
                ...prev.fields,
                documentation: [newDoc, ...prev.fields.documentation],
              },
            }
          : prev
      );

      toast({
        title: "Success",
        description: "Document uploaded successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
      console.error(error);
      throw error;
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setPitchDetails((prev) =>
        prev
          ? {
              ...prev,
              fields: {
                ...prev.fields,
                documentation: prev.fields.documentation.filter(
                  (doc) => doc.id !== id
                ),
              },
            }
          : prev
      );

      toast({
        title: "Success",
        description: "Document deleted successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
      console.error(error);
      throw error;
    }
  };

  const handleMakeOffer = async (offerContent: string) => {
    try {
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

  const formatLanguages = (languages: string[]) => {
    if (languages.length === 0) return "";
    if (languages.length === 1) return languages[0];
    if (languages.length === 2) return `${languages[0]} and ${languages[1]}`;
    const lastLanguage = languages[languages.length - 1];
    const otherLanguages = languages.slice(0, -1).join(", ");
    return `${otherLanguages} and ${lastLanguage}`;
  };

  const processTeamData = (teamMembers: TeamMemberDetails[]) => {
    const ageData = teamMembers.map((member) => ({
      x: member.firstName,
      y: parseInt(member.age) || 0,
    }));

    const genderCount = teamMembers.reduce((acc, member) => {
      acc[member.gender] = (acc[member.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const languageCount = teamMembers.reduce((acc, member) => {
      if (!member.language) return acc;
      if (member.language.length === 0) return acc;
      member.language.forEach((lang) => {
        acc[lang] = (acc[lang] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const averageAge =
      teamMembers.reduce(
        (sum, member) => sum + (parseInt(member.age) || 0),
        0
      ) / (teamMembers.length || 1);

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

  if (isDaftarLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedDaftar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No Daftar selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container flex justify-center align-center m-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !pitchDetails) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              {error || "Failed to load pitch details"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { ageData, genderData, languageData, averageAge } = processTeamData(
    pitchDetails.teamMembers
  );

  return (
    <ScrollArea className="h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center border-b border-border py-2 px-4">
        <div className="flex gap-1">
          {fields.map((section) => (
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
                  "absolute inset-x-0 -bottom-[10px] h-[2px] transition-opacity rounded-[0.35rem]",
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
            variant="destructive"
            size="sm"
            className="rounded-[0.35rem]"
            onClick={() => setReportDialogOpen(true)}
          >
            Report
          </Button>
        </div>
        <ReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          pitchId={pitchId}
          scoutId={scoutId}
        />
      </div>
      <div className="container mx-auto mt-10">
        {activeSection === "investors-note" && (
          <InvestorsNote scoutId={scoutId} pitchId={pitchId} userId={userId} />
        )}
        {activeSection === "documents" && (
          <DocumentsSection pitchId={pitchId} scoutId={scoutId} />
        )}
        {activeSection === "founders-team" && (
          <div className="space-y-6 mt-4">
            <Card className="border-none bg-[#0e0e0e]">
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Team Members ({pitchDetails.teamMembers.length})
                    </h3>
                    <div className=" grid grid-cols-2 gap-5 ">
                      {pitchDetails.teamMembers.map((member) => {
                        const transformedMember: TeamMember = {
                          id: `${member.firstName}-${member.lastName}`,
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
                            key={transformedMember.id}
                            member={transformedMember}
                          />
                        );
                      })}
                    </div>
                  </div>
                  {/* agregate data */}
                  <div className="grid grid-cols-2 gap-4 mt-[2.75rem]">
                    <div className=" space-y-6">
                      <div>
                        <div className="space-y-6">
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
                    <div className="">
                      <Card className="border-none bg-[#1a1a1a] p-4 mb-2">
                        Average Age: {averageAge.toFixed(1)}
                      </Card>
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
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeSection === "founders-pitch" && (
          <FoundersPitchSection
            pitch={pitchDetails.fields.foundersPitch as FoundersPitch}
            onScheduleMeeting={() => setScheduleMeetingOpen(true)}
          />
        )}
        {activeSection === "investors-analysis" && currentProfile && (
          <TeamAnalysisSection 
            currentProfile={currentProfile}
            teamAnalysis={pitchDetails?.fields.teamAnalysis.map(analysis => ({
              id: analysis.id,
              analyst: {
                id: analysis.analyst.id,
                name: analysis.analyst.name,
                role: analysis.analyst.role,
                avatar: analysis.analyst.avatar || "/avatars/default.jpg",
                daftarName: analysis.analyst.daftarName
              },
              belief: analysis.belief,
              note: analysis.note,
              nps: analysis.nps,
              date: analysis.date
            })) || []}
          />
        )}
        {activeSection === "make-offer" && (
          <MakeOfferSection
            pitchId={pitchId}
            scoutId={scoutId}
            investorId={userId}
          />
        )}
      </div>
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
