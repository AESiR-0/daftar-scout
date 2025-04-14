"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format-date";
import { InvestorProfile } from "@/components/investor-profile";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface TeamAnalysis {
  id: string;
  nps: number;
  analyst: {
    name: string;
    role: string;
    avatar: string;
    daftarName: string;
  };
  belief: "yes" | "no";
  note: string;
  date: string;
}

interface Profile {
  id: string;
  name: string;
  role: string;
  daftarName: string;
  avatar: string;
}

interface TeamAnalysisSectionProps {
  currentProfile: Profile;
  scoutId: string;
  pitchId: string;
}

export function TeamAnalysisSection({
  currentProfile,
}: TeamAnalysisSectionProps) {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const pitchId = pathname.split("/")[5];
  const [belief, setBelief] = useState<"yes" | "no">();
  const [nps, setNps] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [teamAnalysis, setTeamAnalysis] = useState<TeamAnalysis[]>([]);

  const handleSubmit = async () => {
    if (!belief || !note.trim() || nps === null) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/endpoints/pitch/investor/analysis?scoutId=${scoutId}&pitchId=${pitchId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scoutId,
            pitchId,
            analysis: note,
            believeRating: nps,
            shouldMeet: belief === "yes",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit analysis");
      }

      setHasSubmitted(true);
      setNote("");
      setBelief(undefined);
      setNps(null);
    } catch (error) {
      console.error("Error submitting analysis:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!hasSubmitted) return;

    const fetchTeamAnalysis = async () => {
      try {
        const response = await fetch(
          `/api/endpoints/pitch/investor/analysis?scoutId=${scoutId}&pitchId=${pitchId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch team analysis");
        }

        const data = await response.json();
        setTeamAnalysis(data.teamAnalysis);
      } catch (error) {
        console.error("Error fetching team analysis:", error);
      }
    };

    fetchTeamAnalysis();
  }, [hasSubmitted, scoutId, pitchId]);

  const teamSize = teamAnalysis.length;
  const votersCount = teamAnalysis.length;
  const interestedCount = teamAnalysis.filter((a) => a.belief === "yes").length;
  const averageNPS =
    teamAnalysis.length > 0
      ? Math.round(
          teamAnalysis.reduce((sum, a) => sum + a.nps, 0) / teamAnalysis.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-10">
        {/* Left side - Your Analysis */}
        <div className="w-1/2">
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>How strongly do you believe in the startup?</Label>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: 11 }, (_, i) => (
                      <Button
                        key={i}
                        variant={nps === i ? "default" : "outline"}
                        onClick={() => setNps(i)}
                        className={cn(
                          "w-8 h-8 p-0",
                          nps === i && "bg-blue-600 hover:bg-blue-700"
                        )}
                      >
                        {i}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 py-2">
                  <Label>Should we meet the startup?</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={belief === "yes" ? "default" : "outline"}
                      onClick={() => setBelief("yes")}
                      className={
                        belief === "yes"
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }
                    >
                      Yes
                    </Button>
                    <Button
                      variant={belief === "no" ? "default" : "outline"}
                      onClick={() => setBelief("no")}
                      className={
                        belief === "no" ? "bg-red-600 hover:bg-red-700" : ""
                      }
                    >
                      No
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Analysis</Label>
                  <Textarea
                    placeholder="Why do you want to meet... or not meet... in the startup?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[100px] rounded-[0.35rem] bg-muted/50 text-white border p-4"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Once you have submitted your analysis, you won't be able to
                withdraw or delete it.
              </p>

              <Button
                onClick={handleSubmit}
                disabled={
                  !belief || !note.trim() || nps === null || isSubmitting
                }
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Submit Analysis
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Team's Analysis */}
        <div className="w-1/2">
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {!hasSubmitted ? (
                  <div className="flex items-center justify-center h-[400px] text-sm text-muted-foreground">
                    <div className="space-y-2">
                      <p className="text-sm">
                        You can't view your team's analysis until you've shared
                        your own experience.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This is to keep everyone's views unbiased and honest.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-white text-xl font-semibold">
                          {teamSize}
                        </p>
                        <p>Team Size</p>
                      </div>
                      <div>
                        <p className="text-white text-xl font-semibold">
                          {interestedCount}
                        </p>
                        <p>Want to Meet</p>
                      </div>
                      <div>
                        <p className="text-white text-xl font-semibold">
                          {averageNPS}
                        </p>
                        <p>Avg. Belief</p>
                      </div>
                    </div>

                    <ScrollArea className="h-[300px] pr-2">
                      <div className="space-y-4">
                        {teamAnalysis.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-lg border border-muted bg-muted/50 p-4"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <img
                                  src={entry.analyst.avatar}
                                  alt={entry.analyst.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div>
                                  <p className="text-sm font-medium">
                                    {entry.analyst.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {entry.analyst.role} –{" "}
                                    {entry.analyst.daftarName}
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(entry.date)}
                              </div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {entry.note}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 flex gap-4">
                              <span>Belief: {entry.nps}/10</span>
                              <span>
                                Should Meet:{" "}
                                <span
                                  className={
                                    entry.belief === "yes"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }
                                >
                                  {entry.belief.toUpperCase()}
                                </span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
