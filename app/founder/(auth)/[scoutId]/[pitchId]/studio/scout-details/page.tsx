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
import { StudioCard } from "../components/layout/studio-card";
import { Card, CardContent } from "@/components/ui/card";

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
  daftarName: string;
  structure: string;
  website: string;
  location: string;
  onDaftarSince: string;
  bigPicture: string;
  image?: string;
}

interface ScoutDetails {
  title: string;
  description: string;
  videoUrl: string;
  lastDayToPitch: string;
  details: Record<string, string>;
  slug: string;
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
  const isStudio = pathname.includes("scout-details");
  const name = !isStudio
    ? pathname.split("/").pop() || ""
    : "tech-talent-scout-program";

  const scoutId = pathname.split("/")[2];
  const [scoutData, setScoutData] = useState<ScoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDaftarDialog, setShowDaftarDialog] = useState(false);

  useEffect(() => {
    const fetchScoutDetails = async () => {
      try {
        const response = await fetch(
          `/api/endpoints/scoutDetails?scoutId=${scoutId}`
        );

        if (!response.ok) {
          throw new Error("Scout data not found");
        }

        const data = await response.json();
        setScoutData(data);
      } catch (error) {
        setError("Failed to fetch scout details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchScoutDetails();
  }, [name]);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (error || !scoutData) return <ErrorPage />;

  const {
    scout,
    faqs = [],
    updates = [],
    collaboration = [],
    lastDayToPitch,
  } = scoutData;

  return (
    <StudioCard>
      <div className="space-y-6 container mx-auto px-10 py-8">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6 flex">
            {/* Video Section */}
            <div className="flex-1">
            <Card className="flex-1 p-4">
                <div className="relative aspect-video w-full">
                  <video
                    src={scout.videoUrl}
                    controls
                    className="w-full h-full object-cover rounded-[0.35rem]"
                  />
                </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-white">
                    {scout.title}
                  </h1>
                  <div className="flex text-md items-center gap-4">
                    <ShareButton
                      title={scout.title}
                      description={scout.description}
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
                    {collaboration.length > 0 ? (
                      <InvestorProfile investor={collaboration[0]} />
                    ) : (
                      <p className="text-sm text-muted-foreground">No collaboration available.</p>
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

            {/* Tabs Section */}
            <div className="w-[400px] pl-6">
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="grid grid-cols-3 gap-2 bg-[#0e0e0e] p-2 rounded-[0.35rem]">
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
                      {scout.details &&
                        Object.entries(scout.details).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center py-2 border-b border-muted/20 last:border-b-0"
                          >
                            <span className="text-sm font-medium text-white">
                              {key}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {value}
                            </span>
                          </div>
                        ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="faqs">
                  <Card className="bg-[#1a1a1a] border-none rounded-[0.35rem] p-6">
                    <div className="space-y-4">
                      {faqs.length > 0 ? (
                        faqs.map((faq, index) => (
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
                        updates.map((update, index) => (
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
        scoutSlug={scout.slug}
      />
    </StudioCard>
  );
}