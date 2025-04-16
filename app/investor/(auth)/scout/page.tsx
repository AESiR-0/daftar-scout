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

interface Scout {
  id: string;
  title: string;
  collaborator: string[];
  postedby: string;
  status: "Planning" | "scheduled" | "Active" | "Closed";
  scheduledDate?: string | null;
}

interface ScoutStatus {
  Planning: Scout[];
  scheduled: Scout[];
  Active: Scout[];
  Closed: Scout[];
}

export default function ScoutPage() {
  const router = useRouter();
  const { searchQuery, filterValue } = useSearch();
  const [loading, setLoading] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [showMeetings, setShowMeetings] = useState(false);
  const [createScoutOpen, setCreateScoutOpen] = useState(false);
  const [scoutStatus, setScoutStatus] = useState<ScoutStatus>({
    Planning: [],
    scheduled: [],
    Active: [],
    Closed: [],
  });

  const { toast } = useToast();
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

        const grouped: ScoutStatus = {
          Planning: [],
          scheduled: [],
          Active: [],
          Closed: [],
        };

        data.forEach((item: any) => {
          const statusKey = item.status as keyof ScoutStatus;

          // Skip if status is invalid
          if (!grouped[statusKey]) return;

          const scout: Scout = {
            id: item.id,
            title: item.title,
            collaborator: item.collaborator ?? [],
            postedby: item.postedby,
            status: item.status,
            scheduledDate: item.scheduledDate ?? null,
          };

          grouped[statusKey].push(scout);
        });

        setScoutStatus(grouped);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to fetch scouts:", error);
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
      description: "New scout has been added to planning",
    });
  };

  return (
    <div className="space-y-6 px-20 mt-4 container mx-auto">
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
            {scoutStatus.Active.length}
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
            {scoutStatus.Active.length}
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
        <MeetingsPage />
      ) : loading ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
          <h2 className="text-center text-muted-foreground">Loading...</h2>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {Object.entries(filteredScouts).map(([status, scouts]) => (
            <div
              key={status}
              className="bg-muted/30 rounded-lg p-4 min-h-[calc(100vh-12rem)] border border-border"
            >
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
                {scouts.map((scout: any) => (
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
                              `${collaboration} ${
                                scout.collaborator.length === 1
                                  ? ""
                                  : num == scout.collaborator.length - 1
                                  ? "and"
                                  : ", "
                              } `
                          )}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}

                {scouts.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground bg-background/5 rounded-[0.35rem] border border-border">
                    No scout in {status}
                  </div>
                )}
              </div>
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
