"use client";

import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { SelectDaftarDialog } from "@/components/dialogs/create-pitch-dialog";
import { InvestorProfile } from "@/components/InvestorProfile";

function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
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
    videoUrl: scout.investorPitch || "video/mp4.mp4", // Add if available
    slug: scoutId,
    details: {
      "Target Audience Age": `${scout.targetAudAgeStart} - ${scout.targetAudAgeEnd}`,
      Location: scout.targetAudLocation,
      Stage: scout.scoutStage,
      Sector: scout.scoutSector,
      Community: scout.scoutCommunity,
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
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6 flex">
            <div>
              <div className="flex justify-center">
                <div className="relative aspect-video h-[24rem]">
                  <video
                    src={transformedScout.videoUrl}
                    controls
                    className="w-full h-full object-cover rounded-[0.35rem]"
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">
                    {transformedScout.title}
                  </h1>
                  <div className="flex text-md items-center gap-4">
                    <ShareButton
                      title={transformedScout.title}
                      description={transformedScout.description}
                    />
                    <Button
                      className="bg-muted px-4 py-4 hover:bg-muted/50 text-white"
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
            </div>

            <div className="ml-6 pl-3 h-full">
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="faqs" className="flex items-center gap-1">
                    FAQs
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem]">
                      {transformedScout.faqs.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="updates"
                    className="flex items-center gap-1"
                  >
                    Updates
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem]">
                      {transformedScout.updates.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="border-l-4 px-5 py-5">
                  <div className="p-2 pt-0 space-y-3">
                    {Object.entries(transformedScout.details).map(
                      ([key, value]) => (
                        <div key={key} className="rounded-[0.35rem]">
                          <p className="text-sm text-muted-foreground">
                            {key}: <span className="font-medium">{value}</span>
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="faqs" className="border-l-4 px-5 py-5">
                  <div className="space-y-4">
                    {transformedScout.faqs.map((faq: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <h3 className="text-muted-foreground">
                          {faq.question}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="updates" className="border-l-4 px-5 py-5">
                  <div className="space-y-2">
                    {transformedScout.updates.map(
                      (
                        update: {
                          date: string | number | Date;
                          content:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactPortal
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                        },
                        index: Key | null | undefined
                      ) => (
                        <div
                          key={index}
                          className="p-4 pb-0 pt-0 rounded-[0.35rem]"
                        >
                          <p className="text-sm text-muted-foreground">
                            {new Date(update.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {update.content}
                          </p>
                        </div>
                      )
                    )}
                  </div>
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
    </>
  );
}
