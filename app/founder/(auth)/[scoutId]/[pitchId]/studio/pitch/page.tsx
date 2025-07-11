"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Check, Clock, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentDialog } from "@/components/dialogs/payment-dialog";
import formatDate from "@/lib/formatDate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface ApprovalRequest {
  id: string;
  userName: string;
  userLastName: string;
  designation: string;
  date: string;
  hasApproved: boolean;
  profile: {
    name: string;
    age: string;
    gender: string;
    email: string;
    phone: string;
    location: string;
    language: string[];
    designation: string;
  };
}

const getStatusIcon = (status: boolean) => {
  if (status) return <Check className="h-5 w-5 text-green-500" />;
  return <Clock className="h-5 w-5 text-yellow-500" />;
};

export default function PitchPage() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { toast } = useToast();
  const pitchId = pathname.split("/")[3];
  const isDemoPitch = pitchId === "HJqVubjnQ3RVGzlyDUCY4";
  const [specificAsks, setSpecificAsks] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([
    {
      id: "",
      userName: "",
      userLastName: "",
      designation: " ",
      date: formatDate("2024-03-18T16:45:00"),
      hasApproved: true,
      profile: {
        name: "",
        age: " ",
        gender: " ",
        email: " ",
        phone: "",
        designation: " ",
        language: [""],
        location: "",
      },
    },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentUserId] = useState("1"); // Demo: John Smith as current userName
  const [pitchApproved, setPitchApproved] = useState(false);
  const [hasIncompleteAnswers, setHasIncompleteAnswers] = useState(false);
  const [answersCount, setAnswersCount] = useState(0);

  useEffect(() => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
    }
  }, [isDemoPitch, toast]);

  useEffect(() => {
    if (pitchId) {
      fetchTeamDetails();
    }
  }, []);

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch(
        `/api/endpoints/pitch/founder/pitch?pitchId=${pitchId}`
      );
      if (!response.ok) throw new Error("Failed to fetch team details");
      const data = await response.json();
      setApprovalRequests(data.team);
      data.team.forEach((member: ApprovalRequest) => {
        if (member.hasApproved) {
          setTermsAccepted(true);
        }
      });
      setSpecificAsks(data.askForInvestor ?? "");
      setPitchApproved(data.pitchApproved);
      setSubmitted(data.submitted);
      setHasIncompleteAnswers(data.hasIncompleteAnswers);
      setAnswersCount(data.answersCount);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching team details:", error);
      toast({
        title: "Error",
        description: "Failed to load team details",
        variant: "destructive",
      });
    }
  };

  // Save pitch updates
  const savePitchDetails = async () => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }
    if (!pitchId) {
      toast({
        title: "Error",
        description: "No pitch selected",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId,
          askForInvestor: specificAsks,
          status: termsAccepted ? "pending" : "draft", // Update status based on terms
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save pitch");
      }

      toast({
        title: "Success",
        description: "Pitch details saved",
      });
    } catch (error: any) {
      console.error("Error saving pitch:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save pitch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approval toggle
  const handleApprovalToggle = async (requestId: string) => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }
    if (requestId !== currentUserId) return;

    const updatedApprovalRequests = approvalRequests.map((req) =>
      req.id === requestId
        ? {
          ...req,
          status: req.hasApproved,
          date: formatDate(new Date().toISOString()),
        }
        : req
    );

    setApprovalRequests(updatedApprovalRequests);

    // Optionally send the update to the server
    await fetch("/api/endpoints/pitch/founder/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pitchId,
        userNameId: requestId, // Assuming requestId is the userName's ID
        hasApproved: true,
      }),
    });
  };

  // Handle pitch approval
  const handlePitchApproval = async () => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }
    if (!termsAccepted) {
      toast({
        title: "Error",
        description: "Please accept terms before approving",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId,
          askForInvestor: specificAsks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve pitch");
      }

      const data = await response.json();
      if (data.allApproved) {
        setPitchApproved(true);
      }

      toast({
        title: "Success",
        description: "Pitch approval updated successfully",
      });
    } catch (error: any) {
      console.error("Error approving pitch:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve pitch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pitch submission
  const handlePitchSubmission = async () => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }
    if (!termsAccepted) {
      toast({
        title: "Error",
        description: "Please accept terms before submitting",
        variant: "destructive",
      });
      return;
    }
    if (!pitchApproved) {
      toast({
        title: "Error",
        description: "Pitch must be approved before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId,
          pitchName: "Current Pitch",
          askForInvestor: specificAsks,
          status: "submitted",
          isCompleted: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit pitch");
      }

      setSubmitted(true);
      toast({
        title: "Success",
        description: "Pitch submitted successfully",
      });
    } catch (error: any) {
      console.error("Error submitting pitch:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit pitch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalMembers = approvalRequests.length;
  console.log(approvalRequests);

  const approvedCount = approvalRequests.filter(
    (req) => req.hasApproved === true
  ).length;

  const getIncompleteAnswersMessage = () => {
    if (hasIncompleteAnswers) {
      return `Please complete all pitch questions (${answersCount}/7 answered)`;
    }
    return "";
  };

  return (
    <div className="px-10 container mx-auto py-5 space-y-6 flex gap-8">
      {/* Left Section: Pitch & Questions */}
      <div className="w-2/3 space-y-6">
        <ScrollArea className="space-y-6">
          {/* Specific Asks Section */}
          <div className="space-y-2  min-h-[150px] px-1">
            <Label>Do you have any specific ask from the Investor?</Label>
            <Textarea
              value={specificAsks}
              disabled={pitchApproved || isDemoPitch}
              onChange={(e) => {
                if (!isDemoPitch) {
                  const words = e.target.value.trim().split(/\s+/).length;
                  if (words <= 500 || e.target.value === '') {
                    setSpecificAsks(e.target.value);
                  }
                }
              }}
              className="h-[250px] max-h-[250px] bg-muted/50 resize-y rounded-xl"
              placeholder="What specific asks do you have for investors?"
            />
            <span className="text-sm text-muted-foreground mt-1">
              {specificAsks ? `${specificAsks.trim().split(/\s+/).length}/500 words` : '0/500 words'}
            </span>
          </div>

          {/* Team Approvals Section */}
          <div className="flex items-start mt-10 px-1 space-x-2 mb-4">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              disabled={pitchApproved || isDemoPitch}
              className="h-5 w-5 border-2 mt-1 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              onCheckedChange={(checked: boolean) => {
                !isDemoPitch && setTermsAccepted(checked);
              }}
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have checked the message and the pitch. It does not include
              nudity, bad language, false claims, scams or fraud, copying
              someone else's work, threats, hate, offensive content, illegal
              activity, bullying, fake videos, or wrong information. If any of
              these are found, your data can be removed, and legal action may be
              taken by investors or authorities as per your country's rules. By
              sharing this, you accept full responsibility for your content and
              agree to keep it honest and respectful.
            </label>
          </div>

          <Button
            className="w-full rounded-[0.35rem] bg-primary hover:bg-primary/90"
            size="lg"
            onClick={handlePitchApproval}
            disabled={isLoading || !termsAccepted || pitchApproved || submitted || hasIncompleteAnswers || isDemoPitch}
          >
            {pitchApproved ? "Pitch Approved" : "Approve Pitch"}
          </Button>

          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Team's Approval Required</h3>
              <div className="text-sm text-muted-foreground">
                {approvedCount} of {totalMembers}
              </div>
            </div>

            <div>
              {approvalRequests.map((member, index) => {
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{index + 1}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {member.userName} {member.userLastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.designation[0].toUpperCase()}
                          {member.designation.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleApprovalToggle(member.id)}
                    >
                      {getStatusIcon(member.hasApproved)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Section: Action & Errors */}
      <div className="w-1/3 pl-6 pt-1 space-y-6">
        <Button
          className="w-full rounded-[0.35rem] bg-muted hover:bg-muted/50"
          size="lg"
          onClick={handlePitchSubmission}
          disabled={isLoading || !termsAccepted || !pitchApproved || submitted || hasIncompleteAnswers || isDemoPitch}
        >
          Pitch Now
        </Button>

        <Card className="p-4 border bg-muted/10">
          <h3 className="text-sm font-medium mb-2">{submitted ? "Pitch already submitted" : "Pitch not shared"}</h3>
          <p className="text-xs text-muted-foreground">{submitted ? "" : "Reason"}</p>
          <p className="text-xs text-muted-foreground">
            {hasIncompleteAnswers
              ? getIncompleteAnswersMessage()
              : !pitchApproved
                ? "Please check your team's approval and ensure all members have approved the pitch."
                : submitted
                  ? ""
                  : "Pitch is ready but not submitted."}
          </p>
        </Card>
      </div>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      />
    </div>
  );
}
