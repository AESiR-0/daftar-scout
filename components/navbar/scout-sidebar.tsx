"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Share2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { EndScoutingDialog } from "../dialogs/end-scouting-dialog";
import { UpdatesDialog } from "../dialogs/updates-dialog";
import { LaunchProgramDialog } from "../dialogs/launch-program-dialog";
import { InsightsDialog } from "../dialogs/insights-dialog";
import { usePathname } from "next/navigation";

interface Pitch {
  id: string;
  pitchName: string;
  daftarName: string;
  Believer: string;
  averageNPS: string;
  interestedCount: string;
}

interface Section {
  id: string;
  title: string;
  pitches: Pitch[];
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
  const pathname = usePathname();
  const isStudio = pathname.includes("studio");

  useEffect(() => {
    if (pathname.includes("planning") || pathname.includes("scheduled")) {
      setIsShowScroll(false);
    }
  }, [pathname]);
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Format scout name for display
  const scoutName = scoutSlug === undefined ? "Test" : scoutSlug[0];
  const scoutId = scoutSlug[1];
  if (isStudio) {
    return null;
  }
  if (isPlanning) {
    return (
      <div className="w-[16rem] p-4 h-full">
        <div className="bg-[#1a1a1a] flex h-full rounded-[0.35rem] flex-col">
          {/* Scout Name Header */}
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
            </div>
          </div>

          {/* Empty flex space */}
          <div className="flex-1" />
        </div>
      </div>
    );
  } else if (isScheduling) {
    return (
      <div className="w-[16rem]  p-4  h-full">
        <div className="bg-[#1a1a1a] flex h-full rounded-[0.35rem] flex-col">
          <div className="border-b shrink-0">
            <div className="border-b px-4 py-4">
              <h2 className="text-[14px] font-semibold">{scoutName}</h2>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-[16rem]  py-4 pl-4 h-full">
      <div className="bg-[#1a1a1a] flex h-full rounded-[0.35rem] flex-col">
        {/* Scout Name Header */}
        <div className="border-b shrink-0">
          <div className="border-b px-4 py-4">
            <h2 className="text-[14px] font-semibold">{scoutName}</h2>
          </div>
          <div className="px-4 py-2">
            <Link href={`/investor/scout/${scoutSlug}/studio`}>
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
              className="w-full px-0 py-0  text-white justify-start"
              onClick={() => setUpdatesOpen(true)}
            >
              Updates
            </Button>
          </div>
        </div>

        {/* Scrollable Sections */}
        {isShowScroll && (
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {sections.map((section) => (
                <div key={section.id}>
                  <Button
                    variant="ghost"
                    className="w-full px-2 justify-between font-normal "
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.includes(section.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {section.title}{" "}
                      <Badge variant="secondary">
                        {section.pitches.length}
                      </Badge>
                    </div>
                  </Button>

                  {expandedSections.includes(section.id) && (
                    <div className="mx-4 space-y-2 mt-2">
                      {section.pitches.map((pitch) => (
                        <Link
                          key={pitch.id}
                          href={`/investor/scout/${scoutSlug}/details/${pitch.id}`}
                        >
                          <Card className="hover:bg-muted/50 mt-1 transition-colors">
                            <CardContent className="p-4 space-y-2">
                              <h3 className="font-medium text-sm">
                                {pitch.pitchName}
                              </h3>
                              <div className="text-xs text-muted-foreground">
                                <p>NPS Score: {pitch.averageNPS}</p>
                                <p>
                                  Interested Team Members:{" "}
                                  {pitch.interestedCount}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Action Buttons */}
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

          {/* <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => setInsightsOpen(true)}
        >
          Insights
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
              alert("Link copied to clipboard!");
            });
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button> */}
        </div>

        {/* Dialogs */}
        <EndScoutingDialog
          open={endScoutingOpen}
          onOpenChange={setEndScoutingOpen}
          onConfirm={() => {
            console.log("Ending scouting process...");
          }}
        />

        <UpdatesDialog
          open={updatesOpen}
          onOpenChange={setUpdatesOpen}
          updates={[]}
          onAddUpdate={(content: string) => {
            console.log("Adding update:", content);
          }}
          onDeleteUpdate={(id: string) => {
            console.log("Deleting update:", id);
          }}
        />

        <LaunchProgramDialog
          open={launchProgramOpen}
          onOpenChange={setLaunchProgramOpen}
          onSubmitFeedback={(feedback: string) => {
            console.log("Submitting feedback:", feedback);
          }}
        />

        <InsightsDialog open={insightsOpen} onOpenChange={setInsightsOpen} />
      </div>
    </div>
  );
}
