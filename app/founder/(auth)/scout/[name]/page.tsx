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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export default function Page() {
  const pathname = usePathname();
  const scoutId = pathname.split("/").pop() || "";
  const [scoutData, setScoutData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [showDaftarDialog, setShowDaftarDialog] = useState(false);

  useEffect(() => {
    async function fetchScout() {
      try {
        const res = await fetch(
          `/api/endpoints/scoutDetails?scoutId=${scoutId}`
        );
        if (!res.ok) throw new Error("Failed to fetch scout");
        const data = await res.json();
        setScoutData(data);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    }

    fetchScout();
  }, [scoutId]);

  if (error) return <ErrorPage />;
  if (!scoutData) return <div className="text-white p-10">Loading...</div>;

  const { scout, faqs, updates, collaboration, lastDayToPitch } = scoutData;

  const transformedScout = {
    title: `Scout Opportunity: ${scout.scoutStage}`,
    description: `Sector: ${scout.scoutSector} | Community: ${scout.scoutCommunity}`,
    videoUrl: scout.investorPitch || "video/mp4.mp4",
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
      date: u.updateDate,
      content: u.updateInfo,
    })),
    lastPitchDate: lastDayToPitch,
  };

  const collaborationDetails = {
    image: collaboration[0]?.image || "",
    daftarName: collaboration[0]?.name || "",
    structure: collaboration[0]?.structure || "",
    onDaftarSince: collaboration[0]?.onDaftarSince || "",
    bigPicture: collaboration[0]?.bigPicture || "",
    website: collaboration[0]?.website || "",
    location: collaboration[0]?.location || "",
  };

  return (
    <>
      <div className="space-y-6 container mx-auto px-10 py-8">
        <div className="flex gap-6">
          <Card className="flex-1 bg-[#0e0e0e] border-none p-4">
            <div className="relative aspect-video w-full">
              <video
                src={transformedScout.videoUrl}
                controls
                className="w-full h-full object-cover rounded-[0.35rem]"
              />
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">
                  {transformedScout.title}
                </h1>
                <div className="flex text-md items-center gap-4">
                  <ShareButton
                    title={transformedScout.title}
                    description={transformedScout.description}
                  />
                  <Button
                    className="bg-blue-500 px-4 py-4 hover:bg-blue-600 text-white rounded-[0.35rem]"
                    onClick={() => setShowDaftarDialog(true)}
                  >
                    Pitch Now
                  </Button>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                <div className="text-sm text-muted-foreground">
                  Collaboration:{" "}
                  <InvestorProfile investor={collaborationDetails} />
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
                    {transformedScout.updates.length > 0 ? (
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
                        we’ll notify you.
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
