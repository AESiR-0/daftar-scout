"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearch } from "@/lib/context/search-context";
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Pitch = {
  id: string;
  pitchName: string;
  location: string;
  scoutId: string | null;
  demoLink: string;
  stage: string;
  askForInvestor: boolean;
  createdAt: string;
  status: string | null;
  isCompleted: boolean;
  teamSize: number | null;
  isPaid: boolean;
};

const founderStatusOrder = [
  "Inbox",
  "Accepted",
  "Declined",
  "Withdrawn",
  "Deleted",
];

const emptyStateMessages: Record<string, { title: string; description: string }> = {
  Inbox: {
    title: "Your Inbox Is Empty",
    description: "Once an investor reaches out, their offer will appear here.",
  },
  Accepted: {
    title: "No Pitch Accepted Yet",
    description: "Once either you or the investor accepts the offer, it will show up here.",
  },
  Declined: {
    title: "No Pitch Declined Yet",
    description: "If you or the investor declines an offer, it will appear here.",
  },
  Withdrawn: {
    title: "No Pitch Withdrawn Yet",
    description: "When a pitch is withdrawn by you or the investor, it'll show up here.",
  },
};

type PitchBoardPageProps = {
  pitches: Pitch[];
};

export default function PitchBoardPage({ pitches }: PitchBoardPageProps) {
  const { searchQuery, filterValue } = useSearch();
  const [createDaftarOpen, setCreateDaftarOpen] = useState(false);
  const [groupedPitches, setGroupedPitches] = useState<Record<string, Pitch[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate brief loading to ensure skeleton visibility
    const timer = setTimeout(() => {
      const grouped: Record<string, Pitch[]> = {};
      for (const pitch of pitches) {
        const status = pitch.status ?? "Inbox";
        if (!grouped[status]) grouped[status] = [];
        grouped[status].push(pitch);
      }
      setGroupedPitches(grouped);
      setLoading(false);
    }, 500); // Adjust delay as needed (500ms ensures skeleton visibility)

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [pitches]);

  const filteredPitches = Object.entries(groupedPitches).reduce(
    (acc, [status, statusPitches]) => {
      const filtered = statusPitches.filter((pitch) => {
        const matchesSearch =
          pitch.pitchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pitch.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
          filterValue === "all" ||
          (filterValue === "planning" && status === "Planning") ||
          (filterValue === "inbox" && status === "Inbox") ||
          (filterValue === "accepted" && status === "Accepted") ||
          (filterValue === "declined" && status === "Declined") ||
          (filterValue === "withdrawn" && status === "Withdrawn") ||
          (filterValue === "deleted" && status === "Deleted");

        return matchesSearch && matchesFilter;
      });

      return filtered.length > 0 ? { ...acc, [status]: filtered } : acc;
    },
    {} as Record<string, Pitch[]>
  );

  const hasPitches = Object.values(filteredPitches).some(
    (arr) => arr.length > 0
  );

  if (loading) {
    return (
      <div className="min-h-screen space-y-6 mx-auto flex-col items-center justify-center px-4 py-6">
        <ScrollArea className="w-[calc(100vw-12rem)] flex justify-center items-center rounded-[0.35rem]">
          <div className="flex gap-6 p-1">
            {founderStatusOrder.map((status) => (
              <div
                key={status}
                className="flex-none w-[300px] bg-muted/30 rounded-[0.35rem] p-4 min-h-[calc(100vh-12rem)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 bg-background" />
                    <Skeleton className="h-4 w-6 rounded-[0.35rem] bg-background" />
                  </div>
                </div>
                <div className="space-y-3">
                  {Array(2)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-[0.35rem] bg-background border"
                      >
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 mx-auto flex-col items-center justify-center px-4 py-6">
      {hasPitches ? (
        <ScrollArea className="w-[calc(100vw-12rem)] flex justify-center items-center rounded-[0.35rem]">
          <div className="flex gap-6 p-1">
            {founderStatusOrder.map((status) => {
              const statusPitches = filteredPitches[status] || [];
              return (
                <div
                  key={status}
                  className="flex-none w-[300px] bg-muted/30 rounded-[0.35rem] p-4 min-h-[calc(100vh-12rem)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{status}</h3>
                      <div className="text-xs text-muted-foreground bg-muted rounded-[0.35rem] px-2 py-1">
                        {statusPitches.length}
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    {statusPitches.length === 0 && emptyStateMessages[status] ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Card className="w-full p-4 bg-muted/50 rounded-[0.35rem]">
                          <h4 className="text-md text-left text-muted-foreground">
                            {emptyStateMessages[status].title}
                          </h4>
                          <p className="text-xs text-left text-muted-foreground mt-2">
                            {emptyStateMessages[status].description}
                          </p>
                        </Card>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {statusPitches.map((pitch) => (
                          <Link
                            key={pitch.id}
                            href={`/founder/${pitch.scoutId}/${pitch.id}/studio`}
                          >
                            <div className="p-4 rounded-[0.35rem] mb-2 bg-background border hover:bg-muted hover:border-muted transition-all duration-200 ease-in-out cursor-pointer">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-sm">
                                    {pitch.pitchName}
                                  </h4>
                                  <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-xs">
                                      Pitch Location: {pitch.location}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center h-[40vh]">
          <p className="text-lg text-muted-foreground">No pitches yet</p>
        </div>
      )}
      <CreateDaftarDialog
        onSuccess={() => setCreateDaftarOpen(false)}
        open={createDaftarOpen}
        onOpenChange={setCreateDaftarOpen}
      />
    </div>
  );
}