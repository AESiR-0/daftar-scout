"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { SelectDaftarDialog } from "@/components/dialogs/create-pitch-dialog";
import { InvestorProfile } from "@/components/InvestorProfile";
import { StudioCard } from "../components/layout/studio-card";
import { Card } from "@/components/ui/card";

// Types
interface Faq {
  faqQuestion: string;
  faqAnswer: string;
}

interface Update {
  updateDate: string;
  updateInfo: string;
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

interface ScoutDetails {
  targetAudAgeStart: number;
  scoutName: string;
  targetAudAgeEnd: number;
  scoutCommunity: string;
  scoutGender: string;
  targetAudLocation: string;
  scoutStage: string;
  scoutSector: string[];
  lastDayToPitch: string;
  investorPitch: string;
}

interface ScoutData {
  scout: ScoutDetails;
  faqs: Faq[];
  updates: Update[];
  collaboration: Collaboration[];
  lastDayToPitch: string;
}

function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1 className="text-2xl font-bold text-white">Scout Not Found</h1>
      <Link
        href="/founder/scout"
        className="px-4 py-2 bg-muted hover:bg-muted/50 text-white rounded transition-colors"
      >
        Go Back
      </Link>
    </div>
  );
}

export default function ScoutDetailsPage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[2];
  const pitchId = pathname.split("/")[3];
  const [scoutData, setScoutData] = useState<ScoutData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDaftarDialog, setShowDaftarDialog] = useState(false);

  useEffect(() => {
    async function fetchScout() {
      if (!scoutId) {
        console.error("No scoutId found in URL");
        setError(true);
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching scout data for:", { scoutId, pitchId });
        const res = await fetch(
          `/api/endpoints/scoutDetails?scoutId=${scoutId}`
        );
        if (!res.ok) throw new Error("Failed to fetch scout");
        const data = await res.json();
        console.log("Received scout data:", data);
        setScoutData(data);
      } catch (err) {
        console.error("Error fetching scout details:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchScout();
  }, [scoutId, pitchId]);

  if (loading) {
    return (
      <StudioCard>
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      </StudioCard>
    );
  }

  if (error || !scoutData) {
    return (
      <StudioCard>
        <ErrorPage />
      </StudioCard>
    );
  }

  const {
    scout,
    faqs = [],
    updates = [],
    collaboration,
    lastDayToPitch,
  } = scoutData;

  return (
    <StudioCard>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex gap-6 ">
              {/* Main Content */}
              <div className="flex-1">
                <Card className="bg-[#0e0e0e] border-none  px-4">
                  <div className="relative aspect-[9/16] w-full h-[750px] max-w-[400px] mx-auto">
                    <video
                      src={scout.investorPitch}
                      controls
                      className="w-full h-full object-cover rounded-[0.35rem]"
                    />
                  </div>

                  <div className="mt-16 flex flex-col justify-start items-start ">
                    <div className="flex items-center">
                      <h1 className="text-2xl font-bold text-white">
                        {scout.scoutName}
                      </h1>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Collaboration:{" "}
                        {collaboration && collaboration.length > 0 ? (
                          collaboration.map((collab, index) => (
                            <div key={index} className="pl-2 border-l-2 border-blue-500/50 mt-2">
                              <InvestorProfile investor={{
                                daftarName: collab.name || "",
                                structure: collab.structure ? (typeof collab.structure === 'string' ? collab.structure : '') : '',
                                onDaftarSince: collab.onDaftarSince || "",
                                website: collab.website || "",
                                location: collab.location || "",
                                bigPicture: collab.bigPicture || "",
                                image: collab.image || ""
                              }} />
                            </div>
                          ))
                        ) : (
                          <span>No collaboration available.</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-bold">
                        Last date for pitch:{" "}
                        {new Date(lastDayToPitch).toDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="w-[400px]">
                <Tabs defaultValue="details" className="space-y-4">
                  <TabsList className="grid grid-cols-3 gap-2 bg-[#0e0e0e] px-2 rounded-[0.35rem]">
                    <TabsTrigger
                      value="details"
                      className="rounded-[0.35rem] py-2 text-sm data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white hover:bg-muted/50"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="faqs"
                      className="rounded-[0.35rem] py-2 text-sm data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white hover:bg-muted/50 flex items-center gap-1"
                    >
                      FAQs
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem]">
                        {faqs.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="updates"
                      className="rounded-[0.35rem] py-2 text-sm data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white hover:bg-muted/50 flex items-center gap-1"
                    >
                      Updates
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem]">
                        {updates.length}
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <Card className="bg-[#1a1a1a] border-none rounded-[0.35rem] p-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex justify-between items-center py-2 border-b border-muted/20">
                          <span className="text-sm font-medium text-white">Community</span>
                          <span className="text-sm text-muted-foreground">{scout.scoutCommunity}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-muted/20">
                          <span className="text-sm font-medium text-white">Gender</span>
                          <span className="text-sm text-muted-foreground">{scout.scoutGender}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-muted/20">
                          <span className="text-sm font-medium text-white">Age Range</span>
                          <span className="text-sm text-muted-foreground">{scout.targetAudAgeStart} - {scout.targetAudAgeEnd}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-muted/20">
                          <span className="text-sm font-medium text-white">Location</span>
                          <span className="text-sm text-muted-foreground">{scout.targetAudLocation}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-muted/20">
                          <span className="text-sm font-medium text-white">Stage</span>
                          <span className="text-sm text-muted-foreground">{scout.scoutStage}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-muted/20 last:border-b-0">
                          <span className="text-sm font-medium text-white">Sector</span>
                          <span className="text-sm text-muted-foreground">{scout.scoutSector.join(", ")}</span>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="faqs">
                    <Card className="bg-[#1a1a1a] border-none rounded-[0.35rem] p-6">
                      <div className="space-y-4">
                        {faqs.length > 0 ? (
                          faqs.map((faq: Faq, index: number) => (
                            <div key={index} className="space-y-2">
                              <h3 className="text-sm font-semibold text-white">
                                {faq.faqQuestion}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {faq.faqAnswer}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No FAQs available.
                          </p>
                        )}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="updates">
                    <Card className="bg-[#1a1a1a] border-none rounded-[0.35rem] p-6">
                      <div className="space-y-6">
                        {updates.length > 0 ? (
                          updates.map((update: Update, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-4 relative"
                            >
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                {index < updates.length - 1 && (
                                  <div className="w-0.5 bg-muted/50 flex-1 mt-2" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(update.updateDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                                <p className="text-sm text-white mt-1">
                                  {update.updateInfo}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No updates available.
                          </p>
                        )}
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ScrollArea>
        </div>

        <SelectDaftarDialog
          open={showDaftarDialog}
          onOpenChange={setShowDaftarDialog}
          scoutSlug={scoutId}
        />
      </div>
    </StudioCard>
  );
}
