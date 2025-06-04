"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { SelectDaftarDialog } from "@/components/dialogs/create-pitch-dialog";
import { InvestorProfile } from "@/components/InvestorProfile";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactPlayer from "react-player";

interface Collaboration {
  image: string;
  name: string;
  structure: string;
  onDaftarSince: string;
  bigPicture: string;
  website: string;
  location: string;
}

interface InvestorProfileProps {
  image: string;
  daftarName: string;
  structure: string;
  onDaftarSince: string;
  bigPicture: string;
  website: string;
  location: string;
}

function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold text-white">Scout Not Found</h1>
      <Link
        href="/founder/pitch"
        className="px-4 py-2 bg-muted hover:bg-muted/50 text-white rounded transition-colors"
      >
        Go Back
      </Link>
    </div>
  );
}

export default function ScoutDetailsPage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/").pop() || "";
  const [scoutData, setScoutData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDaftarDialog, setShowDaftarDialog] = useState(false);
  const { toast } = useToast();
  const isDemoScout = scoutId === "jas730";

  useEffect(() => {
    if (isDemoScout) {
      toast({
        title: "Demo Scout",
        description: "This is a demo scout. You cannot pitch to it. You have a sample pitch created in the pitch page.",
        variant: "destructive",
      });
    }
  }, [isDemoScout, toast]);

  useEffect(() => {
    async function fetchScout() {
      try {
        console.log("Fetching scout details for ID:", scoutId);
        const res = await fetch(
          `/api/endpoints/scoutDetails?scoutId=${scoutId}`
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || 
            `Failed to fetch scout (${res.status}): ${res.statusText}`
          );
        }
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
  }, [scoutId]);

  if (loading) {
    return (
      <div className="min-h-screen space-y-6 container mx-auto px-10 py-8">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <Card className="flex-1 bg-[#0e0e0e] border-none p-4">
            <Skeleton className="w-full aspect-[9/16] rounded-[0.35rem]" />
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-1/3" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-[0.35rem]" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </Card>

          {/* Sidebar with Tabs */}
          <div className="w-[400px] space-y-4">
            <div className="grid grid-cols-3 gap-2 bg-[#0e0e0e] px-2 rounded-[0.35rem]">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-8 rounded-[0.35rem]"
                  />
                ))}
            </div>
            <Card className="bg-[#1a1a1a] border-none rounded-[0.35rem] p-6">
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="flex gap-10 items-center py-2 border-b border-muted/20 last:border-b-0"
                    >
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <ErrorPage />;

  const { scout, faqs, updates, collaboration, lastDayToPitch } = scoutData;

  const transformedScout = {
    title: `${scout.scoutStage}`,
    description: `Sector: ${scout.scoutSector} | Community: ${scout.scoutCommunity}`,
    videoUrl: scout.investorPitch && scout.investorPitch.trim() !== "" ? scout.investorPitch : null,
    slug: scoutId,
    details: {
      Community: scout.scoutCommunity,
      Gender: scout.scoutGender,
      Age: `${scout.targetAudAgeStart} - ${scout.targetAudAgeEnd}`,
      Location: scout.targetAudLocation,
      Stage: scout.scoutStage,
      Sector: scout.scoutSector,
    },
    faqs: faqs.map((f: any) => ({
      question: f.faqQuestion,
      answer: f.faqAnswer,
    })),
    updates: updates.map((u: any) => ({
      date: new Date(u.updateDate).toISOString(),
      content: u.updateInfo,
    })) || [],
    lastPitchDate: lastDayToPitch,
  };

  const collaborations = collaboration.map((c: Collaboration): InvestorProfileProps => ({
    image: c.image || "",
    daftarName: c.name || "",
    structure: c.structure[0] + c.structure.slice(1) || "",
    onDaftarSince: c.onDaftarSince || "",
    bigPicture: c.bigPicture || "",
    website: c.website || "",
    location: c.location || "",
  }));

  return (
    <>
      <div className="min-h-screen space-y-6 container mx-auto px-10 py-8">
        <div className="flex gap-6">
          <Card className="flex-1 bg-[#0e0e0e] border-none p-4">
            <div className="mx-auto relative aspect-[9/16] w-[300px] h-[533px]">
              {transformedScout.videoUrl ? (
                <ReactPlayer
                  url={transformedScout.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded-[0.35rem]">
                  <p className="text-sm text-muted-foreground">No video available</p>
                </div>
              )}
              <div className="video-error hidden w-full h-full absolute top-0 left-0 flex items-center justify-center bg-muted rounded-[0.35rem]">
                <p className="text-sm text-muted-foreground">Error loading video</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">
                  {transformedScout.title}
                </h1>
                <div className="flex text-md items-center gap-4">
                  <ShareButton
                    daftarName={transformedScout.title}
                    sector={transformedScout.details.Sector}
                    stage={transformedScout.details.Stage}
                    lastDate={transformedScout.lastPitchDate}
                    applyUrl={`https://daftar.com/founder/scout/${transformedScout.slug}`}
                  />
                  <Button
                    className="bg-blue-500 px-4 py-4 hover:bg-blue-600 text-white rounded-[0.35rem] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowDaftarDialog(true)}
                    disabled={isDemoScout}
                  >
                    Pitch Now
                  </Button>
                </div>
              </div>

              <div className="mt-2 space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium mb-2">Collaborations:</p>
                  {collaborations.map((c: any, index: number) => (
                    <div key={index} className="pl-2 border-l-2 border-blue-500/50">
                      <InvestorProfile investor={c} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-bold">
                  Last date for pitch:{" "}
                  {new Date(transformedScout.lastPitchDate).toDateString()}
                </p>
              </div>
            </div>
          </Card>

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
                    {transformedScout.faqs.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="updates"
                  className="rounded-[0.35rem] py-2 text-sm data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white hover:bg-muted/50 flex items-center gap-1"
                >
                  Updates
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem]">
                    {transformedScout.updates.length}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card className="bg-[#1a1a1a] border-none rounded-[0.35rem] p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(transformedScout.details).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex gap-10 items-center py-2 border-b border-muted/20 last:border-b-0"
                        >
                          <span className="text-sm font-medium text-white">
                            {key}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="faqs">
                <Card className="bg-[#1a1a1a] border-none rounded-[0.35rem] p-6">
                  <Accordion type="single" collapsible className="space-y-2">
                    {transformedScout.faqs.length > 0 ? (
                      transformedScout.faqs.map((faq: any, index: number) => (
                        <AccordionItem
                          key={index}
                          value={`faq-${index}`}
                          className="border-b border-muted/20 last:border-b-0"
                        >
                          <AccordionTrigger className="text-sm font-medium text-white hover:no-underline py-3">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground pt-2">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No FAQs shared by the investor
                      </div>
                    )}
                  </Accordion>
                </Card>
              </TabsContent>

              <TabsContent value="updates">
                <Card className="bg-[#1a1a1a] border-none rounded-[0.35rem] p-6">
                  <div className="space-y-6 relative">
                    {Array.isArray(transformedScout.updates) && transformedScout.updates.length > 0 ? (
                      transformedScout.updates.map(
                        (
                          update: { date: string; content: string },
                          index: number
                        ) => (
                          <div
                            key={index}
                            className="flex items-start gap-4 relative"
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                              {index < transformedScout.updates.length - 1 && (
                                <div className="w-0.5 bg-muted/50 flex-1 mt-2" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">
                                {new Date(update.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                              <p className="text-sm text-white mt-1">
                                {update.content}
                              </p>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No Updates Yet. If investors share any information,
                        we'll notify you.
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <SelectDaftarDialog
        open={showDaftarDialog}
        onOpenChange={setShowDaftarDialog}
        scoutSlug={scoutId}
      />
    </>
  );
}