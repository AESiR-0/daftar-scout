"use client";
import { ShareButton } from "@/components/share-button";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { EndScoutingDialog } from "../dialogs/end-scouting-dialog";
import { UpdatesDialog } from "../dialogs/updates-dialog";
import { LaunchProgramDialog } from "../dialogs/launch-program-dialog";
import { InsightsDialog } from "../dialogs/insights-dialog";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface Pitch {
  pitchId: string;
  pitchName: string;
  status: string;
  interestedInvestors: any[];
  averageBelieveRating: string;
}

interface Section {
  id: string;
  title: string;
  pitches: Pitch[];
}

interface ScoutDetails {
  scoutId: string;
  scoutName: string;
  targetAudAgeStart: number;
  targetAudAgeEnd: number;
  scoutCommunity: string;
  scoutGender: string;
  targetAudLocation: string;
  scoutStage: string;
  scoutSector: string[];
  lastDayToPitch: string;
  investorPitch: string;
}

interface Collaboration {
  name: string;
  structure: string;
  website: string;
  location: string;
  onDaftarSince: string;
  bigPicture: string | null;
  image: string | null;
}

export function ScoutSidebar({
  scoutSlug,
  isPlanning = true,
  isScheduling = false,
}: {
  scoutSlug: string[];
  isPlanning?: boolean;
  isScheduling?: boolean;
}) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["inbox"]);
  const [endScoutingOpen, setEndScoutingOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [launchProgramOpen, setLaunchProgramOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [isShowScroll, setIsShowScroll] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [sendingReport, setSendingReport] = useState(false);
  const [scoutDetails, setScoutDetails] = useState<ScoutDetails | null>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const pathname = usePathname();
  const isStudio = pathname.includes("studio");
  const scoutId = pathname.split("/")[3];
  const { data: session } = useSession();

  useEffect(() => {
    if (pathname.includes("planning") || pathname.includes("scheduled")) {
      setIsShowScroll(false);
    }
  }, [pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/endpoints/scouts/pitchesList?scoutId=${scoutId}`
        );
        const data = await res.json();
        
        // Transform the data to match our interface
        const transformedData: Pitch[] = data.data.map((pitch: any) => ({
          pitchId: pitch.pitchId,
          pitchName: pitch.pitchName,
          status: pitch.status,
          interestedInvestors: pitch.interestedInvestors || [],
          averageBelieveRating: pitch.averageBelieveRating || '0'
        }));

        const grouped: Record<string, Pitch[]> = {};
        transformedData.forEach((pitch) => {
          if (!grouped[pitch.status]) {
            grouped[pitch.status] = [];
          }
          grouped[pitch.status].push(pitch);
        });

        const mappedSections: Section[] = Object.entries(grouped).map(
          ([status, pitches], idx) => ({
            id: (idx + 1).toString(),
            title: status,
            pitches,
          })
        );

        setSections(mappedSections);
      } catch (err) {
        console.error("Failed to fetch pitches:", err);
      }
    };

    fetchData();
  }, [scoutId]);

  useEffect(() => {
    const fetchScoutDetails = async () => {
      try {
        const res = await fetch(`/api/endpoints/scoutDetails?scoutId=${scoutId}`);
        if (!res.ok) throw new Error("Failed to fetch scout details");
        const data = await res.json();
        setScoutDetails(data.scout);
        setCollaborations(data.collaboration || []);
      } catch (error) {
        console.error("Error fetching scout details:", error);
      }
    };

    if (scoutId) {
      fetchScoutDetails();
    }
  }, [scoutId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleShare = () => {
    
  };

  const handleSendReport = async () => {
    if (!session?.user?.email) {
      alert("You must be logged in to send a report");
      return;
    }

    if (isPlanning || isScheduling) {
      alert("Reports are only available after scouting has begun");
      return;
    }

    setSendingReport(true);
    try {
      const response = await fetch("/api/scout/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scoutId,
          email: session.user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send report");
      }

      alert("Report has been sent to your email");
    } catch (error) {
      console.error("Failed to send report:", error);
      alert("Failed to send report. Please try again.");
    } finally {
      setSendingReport(false);
    }
  };

  const scoutName = scoutSlug === undefined ? "Test" : scoutSlug[0];

  if (isStudio) return null;

  if (isPlanning) {
    return (
      <div className="w-[16rem] p-4 h-full">
        <div className="bg-[#1a1a1a] flex h-full rounded-[0.35rem] flex-col">
          <div className="border-b shrink-0">
            <div className="border-b px-4 py-4">
              <h2 className="text-[14px] font-semibold">{scoutName}</h2>
            </div>
            <div className="px-4 py-2">
              <Link href={`${scoutId}/studio/details`}>
                <Button
                  variant="link"
                  size="sm"
                  className="w-full text-white px-0 justify-start"
                >
                  Studio
                </Button>
              </Link>
              <Button
                variant="link"
                size="sm"
                className="w-full text-white px-0 justify-start opacity-50 cursor-not-allowed"
                onClick={handleSendReport}
                disabled={true}
              >
                Send Report
              </Button>
            </div>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    );
  }

  if (isScheduling) {
    return (
      <div className="w-[16rem] p-4 h-full">
        <div className="bg-[#1a1a1a] flex h-full rounded-[0.35rem] flex-col">
          <div className="border-b shrink-0">
            <div className="border-b px-4 py-4">
              <h2 className="text-[14px] font-semibold">{scoutName}</h2>
            </div>
            <div className="px-4 py-2">
              <Button
                variant="link"
                size="sm"
                className="w-full text-white px-0 justify-start opacity-50 cursor-not-allowed"
                onClick={handleSendReport}
                disabled={true}
              >
                Send Report
              </Button>
              {scoutDetails && (
                <ShareButton 
                  daftarName={collaborations.map(c => c.name).join(", ")}
                  sector={scoutDetails.scoutSector.join(", ")}
                  stage={scoutDetails.scoutStage}
                  lastDate={scoutDetails.lastDayToPitch}
                  applyUrl={`/founder/scout/${scoutId}`}
                />
              )}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[16rem] py-4 pl-4 h-full">
      <div className="bg-[#1a1a1a] flex h-full rounded-[0.35rem] flex-col">
        <div className="border-b shrink-0">
          <div className="border-b px-4 py-4">
            <h2 className="text-[14px] font-semibold">{scoutName}</h2>
          </div>
          <div className="px-4 py-2">
            <Link href={`/investor/scout/${scoutId}/studio`}>
              <Button
                variant="link"
                size="sm"
                className="w-full text-white px-0 justify-start"
              >
                Studio
              </Button>
            </Link>
            <Button
              variant="link"
              size="sm"
              className="w-full px-0 py-0 text-white justify-start"
              onClick={() => setUpdatesOpen(true)}
            >
              Updates
            </Button>
            <Button
              variant="link"
              size="sm"
              className="w-full text-white px-0 justify-start"
              onClick={handleSendReport}
              disabled={sendingReport}
            >
              {sendingReport ? "Sending..." : "Send Report"}
            </Button>
            {scoutDetails && (
              <ShareButton 
                daftarName={collaborations.map(c => c.name).join(", ")}
                sector={scoutDetails.scoutSector.join(", ")}
                stage={scoutDetails.scoutStage}
                lastDate={scoutDetails.lastDayToPitch}
                applyUrl={`/founder/scout/${scoutId}`}
              />
            )}
          </div>
        </div>

        {isShowScroll && (
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div key={index}>
                  <Button
                    variant="ghost"
                    className="w-full px-2 justify-between font-normal"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.includes(section.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {section.title.charAt(0).toUpperCase() + section.title.slice(1)}
                      <Badge variant="secondary">
                        {section.pitches.length}
                      </Badge>
                    </div>
                  </Button>

                  {expandedSections.includes(section.id) && (
                    <div key={section.id} className="mx-4 space-y-2 mt-2">
                      {section.pitches.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          Looks empty for now
                        </div>
                      ) : (
                        section.pitches.map((pitch, index) => (
                          <Link
                            key={index}
                            href={`/investor/scout/${scoutId}/details/${pitch.pitchId}`}
                          >
                            <Card className="hover:bg-muted/50 mt-1 transition-colors">
                              <CardContent className="p-4 space-y-2">
                                <h3 className="font-medium text-sm">
                                  {pitch.pitchName}
                                </h3>
                                <div className="text-xs text-muted-foreground">
                                  <p>NPS Score: {parseFloat(pitch.averageBelieveRating).toFixed(1) || 'N/A'}</p>
                                  <p>
                                    Interested Team Members:{" "}
                                    {pitch.interestedInvestors.length}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="px-4 py-2 border-t">
          <Button
            size="sm"
            variant="link"
            className="px-0 py-0 text-white"
            onClick={() => setLaunchProgramOpen(true)}
          >
            Launch Program
          </Button>
          <br />
          <Button
            size="sm"
            variant="link"
            className="px-0 py-0 text-white"
            onClick={() => setEndScoutingOpen(true)}
          >
            End Scouting
          </Button>
        </div>

        <EndScoutingDialog
          open={endScoutingOpen}
          onOpenChange={setEndScoutingOpen}
          onConfirm={() => {
            // Add any additional logic here if needed
          }}
        />
        <UpdatesDialog open={updatesOpen} onOpenChange={setUpdatesOpen} />
        <LaunchProgramDialog
          open={launchProgramOpen}
          onOpenChange={setLaunchProgramOpen}
        />
        <InsightsDialog open={insightsOpen} onOpenChange={setInsightsOpen} />
      </div>
    </div>
  );
}