"use client";

import { useSearch } from "@/lib/context/search-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InsightsDialog } from "@/components/dialogs/insights-dialog";
import MeetingsPage from "@/app/founder/(auth)/meetings/page";
import { CreateScoutDialog } from "@/components/dialogs/create-scout-dialog";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface Scout {
  id: string;
  title: string;
  collaborator: string[];
  postedby: string;
  status: "planning" | "scheduled" | "active" | "closed";
  scheduledDate?: string | null;
}

interface ScoutStatus {
  planning: Scout[];
  scheduled: Scout[];
  active: Scout[];
  closed: Scout[];
}

const emptyStateMessages: Record<string, string> = {
  planning: "No scout is currently being planned.",
  scheduled: "There are no scouts on the schedule.",
  active: "You have no active scouts at this time.",
  closed: "You have not closed any scout.",
};

export default function ScoutPage() {
  const router = useRouter();
  const { searchQuery, filterValue } = useSearch();
  const [loading, setLoading] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [showMeetings, setShowMeetings] = useState(false);
  const [createScoutOpen, setCreateScoutOpen] = useState(false);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [scoutStatus, setScoutStatus] = useState<ScoutStatus>({
    planning: [],
    scheduled: [],
    active: [],
    closed: [],
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchMeetingsCount = async () => {
      try {
        const res = await fetch('/api/endpoints/calendar/meetings');
        if (!res.ok) {
          throw new Error('Failed to fetch meetings');
        }
        const meetings = await res.json();
        setMeetingsCount(meetings.length);
      } catch (error) {
        console.error('Error fetching meetings count:', error);
      }
    };

    fetchMeetingsCount();
  }, []);

  useEffect(() => {
    const fetchScoutStatus = async () => {
      try {
        const res = await fetch("/api/endpoints/scouts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (res.status !== 200) {
          toast({
            title: "Error",
            description: "Failed to fetch scouts.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const grouped: ScoutStatus = {
          planning: [],
          scheduled: [],
          active: [],
          closed: [],
        };

        data.forEach((item: any) => {
          const statusKey = item.status.toLowerCase() as keyof ScoutStatus;

          // Skip if status is invalid
          if (!grouped[statusKey]) return;

          const scout: Scout = {
            id: item.id,
            title: item.title,
            collaborator: item.collaborator ?? [],
            postedby: item.postedby,
            status: item.status.toLowerCase(),
            scheduledDate: item.scheduledDate ?? null,
          };

          grouped[statusKey].push(scout);
        });

        setScoutStatus(grouped);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to fetch scouts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch scouts.",
          variant: "destructive",
        });
      }
    };

    fetchScoutStatus();
  }, []);

  const filteredScouts = Object.entries(scoutStatus).reduce(
    (acc, [key, scouts]) => {
      const filtered = scouts.filter((scout: any) => {
        const matchesSearch =
          scout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scout.postedby.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          filterValue === "all" ||
          scout.status.toLowerCase() === filterValue.toLowerCase();
        return matchesSearch && matchesFilter;
      });
      return { ...acc, [key]: filtered };
    },
    {} as ScoutStatus
  );

  const handleScoutCreate = () => {
    router.refresh();
    toast({
      title: "Scout Created",
      description: `New scout has been added to planning. 
      Please refresh to see the changes.`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 px-20 mt-4 container mx-auto bg-[#0e0e0e]">
        {/* Skeleton for Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Skeleton className="h-9 w-28 bg-[#2a2a2a] rounded-[0.3rem]" />
          <Skeleton className="h-9 w-28 bg-[#2a2a2a] rounded-[0.3rem]" />
          <Skeleton className="h-9 w-28 bg-[#2a2a2a] rounded-[0.3rem]" />
        </div>
        {/* Skeleton for Columns */}
        <div className="grid grid-cols-4 gap-6">
          {["planning", "scheduled", "active", "closed"].map(
            (status, index) => (
              <div
                key={index}
                className="bg-muted/30 rounded-lg p-4 min-h-[calc(100vh-12rem)] border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-24 bg-[#2a2a2a]" />
                  <Skeleton className="h-5 w-8 bg-[#2a2a2a]" />
                </div>
                <div className="space-y-5">
                  <Skeleton className="h-20 w-full bg-[#2a2a2a] rounded-[0.35rem]" />
                  <Skeleton className="h-20 w-full bg-[#2a2a2a] rounded-[0.35rem]" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-20 mt-4 container mx-auto bg-[#0e0e0e]">
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => setShowMeetings(true)}
          disabled={loading}
          className={
            showMeetings ? "bg-muted rounded-[0.3rem]" : "rounded-[0.3rem]"
          }
        >
          Meetings
          <Badge
            variant="secondary"
            className="text-xs bg-muted text-muted-foreground"
          >
            {meetingsCount}
          </Badge>
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowMeetings(false)}
          disabled={loading}
          className={
            showMeetings ? "rounded-[0.3rem]" : "bg-muted rounded-[0.3rem]"
          }
        >
          ScoutBoard
          <Badge
            variant="secondary"
            className="text-xs bg-muted text-muted-foreground"
          >
            {scoutStatus.active.length}
          </Badge>
        </Button>

        <Button
          variant="outline"
          disabled={loading}
          className="h-9 rounded-[0.3rem]"
          onClick={() => setCreateScoutOpen(true)}
        >
          New Scout
        </Button>
      </div>

      {showMeetings ? (
        <div className="min-h-screen">
          <MeetingsPage />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {Object.entries(filteredScouts).map(([status, scouts], index) => (
            <div
              key={index}
              className="bg-muted/30 rounded-lg p-4 min-h-[calc(100vh-12rem)] border border-border"
            >
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold capitalize text-foreground">
                      {status}
                    </h2>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-muted text-muted-foreground"
                    >
                      {scouts.length}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-5">
                  {scouts.length === 0 ? (
                    <div className="py-6 px-4 text-sm text-muted-foreground bg-background/5 rounded-[0.35rem] border border-border">
                      {emptyStateMessages[status]}
                    </div>
                  ) : (
                    scouts.map((scout: any) => (
                      <Link
                        key={scout.id}
                        href={`/investor/scout/${scout.id
                          .toLowerCase()
                          .replace(/ /g, "-")}`}
                      >
                        <div className="p-4 m-2 rounded-[0.35rem] hover:border-muted-foreground hover:border bg-background transition-colors">
                          <h3 className="font-medium text-sm text-foreground">
                            {scout.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Collaboration :{" "}
                            <span className="font-medium">
                              {scout.collaborator.map(
                                (collaboration: string, num: number) =>
                                  `${collaboration} ${scout.collaborator.length === 1
                                    ? ''
                                    : num === scout.collaborator.length - 2
                                      ? "and"
                                      : num < scout.collaborator.length - 2
                                        ? ", "
                                        : ""
                                  } `
                              )}
                            </span>
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      )}

      <InsightsDialog open={insightsOpen} onOpenChange={setInsightsOpen} />

      <CreateScoutDialog
        open={createScoutOpen}
        onOpenChange={setCreateScoutOpen}
        onScoutCreate={handleScoutCreate}
      />
    </div>
  );
}
