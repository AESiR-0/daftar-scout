"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { EndScoutingDialog } from "../dialogs/end-scouting-dialog";
import { UpdatesDialog } from "../dialogs/updates-dialog";
import { LaunchProgramDialog } from "../dialogs/launch-program-dialog";
import { InsightsDialog } from "../dialogs/insights-dialog";
import { usePathname } from "next/navigation";

interface Pitch {
  pitchId: string;
  pitchName: string;
  daftarName: string;
  Believer: string;
  averageNPS: string;
  interestedCount: string;
  status: string;
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
  const [sections, setSections] = useState<Section[]>([]);
  const pathname = usePathname();
  const isStudio = pathname.includes("studio");
  const scoutId = pathname.split("/")[3];
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
        const data: Pitch[] = await res.json().then((res) => res.data);

        const grouped: Record<string, Pitch[]> = {};
        await data.map((pitch) => {
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
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
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
            </div>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    );
  }

  if (isScheduling) {
    return (
      <div className="w-[16rem]  p-4  h-full">
        <div className="bg-[#1a1a1a] flex h-full rounded-[0.35rem] flex-col">
          <div className="border-b shrink-0">
            <div className="border-b px-4 py-4">
              <h2 className="text-[14px] font-semibold">{scoutName}</h2>
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
              className="w-full px-0 py-0  text-white justify-start"
              onClick={() => setUpdatesOpen(true)}
            >
              Updates
            </Button>
          </div>
        </div>

        {isShowScroll && (
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div key={index}>
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
                      {section.title}
                      <Badge variant="secondary">
                        {section.pitches.length}
                      </Badge>
                    </div>
                  </Button>

                  {expandedSections.includes(section.id) && (
                    <div key={section.id} className="mx-4 space-y-2 mt-2">
                      {section.pitches.map((pitch, index) => (
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
