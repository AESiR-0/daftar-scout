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

// Types
interface Faq {
  question: string;
  answer: string;
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
  bigPicture: string;
  image: string;
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
  collaboration: Collaboration;
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !scoutData) {
    return <ErrorPage />;
  }

  const { scout, faqs, updates, collaboration, lastDayToPitch } = scoutData;

  return (
    <StudioCard>
      <div className="space-y-6 container mx-auto px-10 py-8">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6 flex">
            {/* Video Section */}
            <div className="">
              <div className="flex justify-center">
                <div className="relative aspect-video h-[24rem]">
                  <video
                    src={scout.videoUrl}
                    controls
                    className="w-full h-full object-cover rounded-[0.35rem] "
                  />
                </div>
              </div>

              {/* Title and Actions Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">{scout.title}</h1>
                  <div className="flex text-md items-center gap-4">
                    <ShareButton
                      title={scout.title}
                      description={scout.description}
                    />
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Collaboration: <InvestorProfile investor={collaboration} />
                  </div>
                  <p className="text-xs text-muted-foreground font-bold">
                    Last date for pitch: {lastDayToPitch}
                  </p>
                </div>
              </div>
            </div>
            <div className=" ml-6 pl-3 h-full">
              {/* Tabs Section */}
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="faqs" className="flex items-center gap-1">
                    FAQs
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem] ">
                      {faqs.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="updates"
                    className="flex items-center gap-1"
                  >
                    Updates
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem] ">
                      {updates.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="border-l-4 px-5 py-5">
                  <div className="p-2 pt-0  space-y-3">
                    {Object.entries(scout.details).map(([key, value]) => (
                      <div key={key} className="rounded-[0.35rem]  ">
                        <p className="text-sm text-muted-foreground ">
                          {key}: <span className="font-medium">{value}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="faqs" className="border-l-4 px-5 py-5">
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
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
                  <div className="space-y-2   ">
                    {updates.map((update, index) => (
                      <div
                        key={index}
                        className="p-4 pb-0 pt-0 rounded-[0.35rem]  "
                      >
                        <p className="text-sm text-muted-foreground">
                          {new Date(update.updateDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {update.updateInfo}
                        </p>
                      </div>
                    ))}
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
        scoutSlug={scout.slug}
      />
    </StudioCard>
  );
}
