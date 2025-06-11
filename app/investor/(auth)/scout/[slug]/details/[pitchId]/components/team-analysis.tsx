"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  role: string;
  image: string;
  daftarName: string;
}

interface TeamAnalysis {
  id: string;
  nps: number;
  analyst: {
    id: string;
    name: string;
    role: string;
    image: string;
    daftarName: string;
  };
  belief: "yes" | "no";
  note: string;
  date: string;
}

interface TeamAnalysisSectionProps {
  currentProfile: Profile;
  teamAnalysis: TeamAnalysis[];
}

interface FormState {
  nps: number | null;
  belief: "yes" | "no" | undefined;
  note: string;
}

export function TeamAnalysisSection({
  currentProfile,
  teamAnalysis: initialTeamAnalysis,
}: TeamAnalysisSectionProps) {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const pitchId = pathname.split("/")[5];
  const { toast } = useToast();
  const hasCheckedMembership = useRef(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Find if current user has submitted an analysis
  const userAnalysis = initialTeamAnalysis.find(
    (analysis) => analysis.analyst.id === currentUserId
  );

  const [formState, setFormState] = useState<FormState>({
    nps: userAnalysis?.nps ?? null,
    belief: userAnalysis?.belief,
    note: userAnalysis?.note ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(!!userAnalysis);
  const [teamAnalysis, setTeamAnalysis] = useState<TeamAnalysis[]>(initialTeamAnalysis);
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState<boolean>(false);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/endpoints/users/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Check if user is a member of the scout and submission status
  useEffect(() => {
    const checkMembershipAndSubmission = async () => {
      if (hasCheckedMembership.current || !currentUserId) return;
      hasCheckedMembership.current = true;

      try {
        setLoading(true);
        // Check membership
        const membersResponse = await fetch(`/api/endpoints/scouts/members?scoutId=${scoutId}`);
        if (!membersResponse.ok) throw new Error('Failed to fetch scout members');
        const membersData = await membersResponse.json();
        const isUserMember = membersData.some((member: any) => member.userId === currentUserId);
        setIsMember(isUserMember);
        
        // If not a member, set hasSubmitted to true and pre-fill with first team member's data
        if (!isUserMember && initialTeamAnalysis.length > 0) {
          setHasSubmitted(true);
          const firstAnalysis = initialTeamAnalysis[0];
          setFormState({
            nps: firstAnalysis.nps,
            belief: firstAnalysis.belief,
            note: firstAnalysis.note
          });
          toast({
            title: "Demo Mode",
            description: "This is a demo, cannot be edited",
            variant: "default",
          });
        } else {
          // Check submission status only if user is a member
          const analysisResponse = await fetch(
            `/api/endpoints/pitch/investor/analysis?scoutId=${scoutId}&pitchId=${pitchId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (analysisResponse.ok) {
            const data = await analysisResponse.json();
            if (data.analysis && data.analysis.length > 0) {
              setHasSubmitted(true);
              // Find the current user's analysis using analyst.id
              const userAnalysis = data.analysis.find((analysis: any) => 
                analysis.analyst.id === currentUserId
              );
              if (userAnalysis) {
                setFormState({
                  nps: userAnalysis.nps,
                  belief: userAnalysis.belief,
                  note: userAnalysis.note
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking membership and submission:", error);
        toast({
          title: "Error",
          description: "Failed to load analysis status",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkMembershipAndSubmission();
  }, [currentUserId]);

  const handleSubmit = async () => {
    if (!formState.belief || !formState.note.trim() || formState.nps === null || !isMember) return;
    setIsSubmitting(true);

    try {
      // Submit the analysis
      const analysisResponse = await fetch(
        `/api/endpoints/pitch/investor/analysis?scoutId=${scoutId}&pitchId=${pitchId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scoutId,
            pitchId,
            analysis: formState.note,
            believeRating: formState.nps,
            shouldMeet: formState.belief === "yes",
          }),
        }
      );

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || "Failed to submit analysis");
      }

      // Update pitch status to review
      const statusResponse = await fetch(
        `/api/endpoints/pitch/investor/status?scoutId=${scoutId}&pitchId=${pitchId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investorStatus: "review"
          }),
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to update pitch status");
      }

      setHasSubmitted(true);
      // Add new analysis to the beginning of the array, ensuring no duplicates
      setTeamAnalysis(prev => {
        const newAnalysis = {
          id: Date.now().toString(),
          nps: formState.nps!,
          analyst: currentProfile,
          belief: formState.belief!,
          note: formState.note,
          date: new Date().toISOString(),
        };
        // Filter out any existing entry for this analyst
        const filteredPrev = prev.filter(entry => entry.analyst.id !== currentProfile.id);
        return [newAnalysis, ...filteredPrev];
      });

      // Reset form state
      setFormState({
        nps: null,
        belief: undefined,
        note: "",
      });

      toast({
        title: "Success",
        description: "Analysis submitted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error submitting analysis:", error);
      toast({
        title: "Error",
        description: "Failed to submit analysis",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const teamSize = teamAnalysis.length;
  const interestedCount = teamAnalysis.filter((a) => a.belief === "yes").length;
  const averageNPS =
    teamAnalysis.length > 0
      ? Math.round(
        teamAnalysis.reduce((sum, a) => sum + a.nps, 0) / teamAnalysis.length
      )
      : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-10">
      <div className="flex justify-between gap-10">
        {/* Left side - Your Analysis */}
        <div className="w-1/2">
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>How strongly do you believe in the startup?</Label>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: 11 }, (_, i) => (
                      <Button
                        key={`nps-${i}`}
                        variant={formState.nps === i ? "default" : "outline"}
                        onClick={() => setFormState(prev => ({ ...prev, nps: i }))}
                        disabled={hasSubmitted || !isMember}
                        className={cn(
                          "w-8 h-8 p-0 rounded-[0.35rem]",
                          formState.nps === i && "bg-blue-600 hover:bg-blue-700",
                          (hasSubmitted || !isMember) && "cursor-not-allowed opacity-50"
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
                      variant={formState.belief === "yes" ? "default" : "outline"}
                      onClick={() => setFormState(prev => ({ ...prev, belief: "yes" }))}
                      disabled={hasSubmitted || !isMember}
                      className={cn(
                        formState.belief === "yes"
                          ? "bg-blue-500 hover:bg-blue-600 rounded-[0.35rem]"
                          : "rounded-[0.35rem]",
                        (hasSubmitted || !isMember) && "cursor-not-allowed opacity-50"
                      )}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={formState.belief === "no" ? "default" : "outline"}
                      onClick={() => setFormState(prev => ({ ...prev, belief: "no" }))}
                      disabled={hasSubmitted || !isMember}
                      className={cn(
                        formState.belief === "no"
                          ? "bg-red-600 hover:bg-red-700 rounded-[0.35rem]"
                          : "rounded-[0.35rem]",
                        (hasSubmitted || !isMember) && "cursor-not-allowed opacity-50"
                      )}
                    >
                      No
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Analysis</Label>
                  <Textarea
                    placeholder="Why do you want to meet... or not meet... in the startup?"
                    value={formState.note}
                    onChange={(e) => setFormState(prev => ({ ...prev, note: e.target.value }))}
                    disabled={hasSubmitted || !isMember}
                    className={cn(
                      "min-h-[100px] rounded-[0.35rem] bg-muted/50 text-white border p-4",
                      (hasSubmitted || !isMember) && "cursor-not-allowed opacity-50"
                    )}
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
                  !formState.belief ||
                  !formState.note.trim() ||
                  formState.nps === null ||
                  isSubmitting ||
                  hasSubmitted ||
                  !isMember
                }
                className={cn(
                  "w-full bg-blue-600 hover:bg-blue-700",
                  (hasSubmitted || !isMember) && "cursor-not-allowed opacity-50"
                )}
              >
                {isSubmitting ? "Submitting..." : "Submit Analysis"}
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
                    <div className="text-sm text-muted-foreground grid grid-cols-4 gap-2 text-center">
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
                        <p>Avg. NPS</p>
                      </div>
                      <div>
                        <p className="text-white text-xl font-semibold">
                          {teamAnalysis.length}
                        </p>
                        <p>Voted</p>
                      </div>
                    </div>

                    <ScrollArea className="h-[calc(100vh-300px)] pr-2">
                      <div className="space-y-4">
                        {teamAnalysis.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-[0.35rem] border border-muted bg-muted/50 p-4"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <img
                                  src={entry.analyst.image}
                                  className="w-8 h-8 rounded-[0.35rem]"
                                />
                                <div>
                                  <p className="text-sm font-medium">
                                    {entry.analyst.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                   {entry.analyst.role.slice(0, 1).toUpperCase() + entry.analyst.role.slice(1)} –{" "}
                                    {entry.analyst.daftarName}
                                  </p>
                                  <div className="flex gap-2">
                                    <p className="text-xs text-muted-foreground">
                                      NPS: {entry.nps}/10
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Should Meet: {entry.belief === "yes" ? "Yes" : "No"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(entry.date)}
                              </div>
                            </div>
                            <div className="text-sm text-justify whitespace-pre-wrap">
                              {entry.note}
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
