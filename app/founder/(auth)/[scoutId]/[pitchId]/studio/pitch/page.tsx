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
import { usePitch } from "@/contexts/PitchContext";

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
  const [userId, setUserId] = useState("");
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const pitchId = pathname.split("/")[3];
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentUserId] = useState("1"); // Demo: John Smith as current userName

  useEffect(() => {
    if (pitchId) {
      fetchTeamDetails();
    }
    fetchUserId(); // Fetch user ID on component mount
  }, [pitchId]);

  const fetchUserId = async () => {
    try {
      const response = await fetch("/api/endpoints/users/getId"); // Adjust the endpoint as needed
      if (!response.ok) throw new Error("Failed to fetch user ID");
      const data = await response.json();
      setUserId(data.id); // Assuming the response contains the userId
    } catch (error) {
      console.error("Error fetching user ID:", error);
      toast({
        title: "Error",
        description: "Failed to load user ID",
        variant: "destructive",
      });
    }
  };

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch(
        `/api/endpoints/pitch/founder/pitch?pitchId=${pitchId}`
      );
      if (!response.ok) throw new Error("Failed to fetch team details");
      const data = await response.json();
      setApprovalRequests(data.team); // Assuming the team data is in the response
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
          userId,
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

  // Handle pitch submission
  const handlePitchSubmission = async () => {
    if (!termsAccepted) {
      toast({
        title: "Error",
        description: "Please accept terms before submitting",
        variant: "destructive",
      });
      return;
    }

    if (approvedCount < totalMembers) {
      toast({
        title: "Error",
        description: "All team members must approve before submission",
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
          pitchName: "Current Pitch", // Required field
          askForInvestor: specificAsks,
          status: "submitted",
          isCompleted: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit pitch");
      }

      setShowPaymentDialog(true); // Open payment dialog on success
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

  return (
    <div className="px-10 container mx-auto py-5 space-y-6 flex gap-8">
      {/* Left Section: Pitch & Questions */}
      <div className="w-2/3 space-y-6">
        <ScrollArea className="space-y-6">
          {/* Specific Asks Section */}
          <div className="space-y-2 px-1">
            <Label>Do you have any specific ask from the Investor?</Label>
            <Textarea
              value={specificAsks}
              onChange={(e) => setSpecificAsks(e.target.value)}
              className="min-h-[100px] bg-muted/50 resize-none rounded-xl"
            />
          </div>

          {/* Team Approvals Section */}
          <div className="flex items-start mt-4 px-1 space-x-2 mb-4">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              className="h-5 w-5 border-2 mt-1 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              onCheckedChange={(checked: boolean) => {
                setTermsAccepted(checked);
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

          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Team's Approval Required</h3>
              <div className="text-sm text-muted-foreground">
                {approvedCount} of {totalMembers}
              </div>
            </div>

            <div>
              {approvalRequests.map((member, index) => (
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
              ))}
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
          disabled={isLoading || !termsAccepted || approvedCount < totalMembers}
        >
          Pitch Now
        </Button>

        <Card className="p-4 border bg-muted/10">
          <h3 className="text-sm font-medium mb-2">Pitch not shared</h3>
          <p className="text-xs text-muted-foreground">Reason</p>
          <p className="text-xs text-muted-foreground">
            {approvedCount < totalMembers
              ? "Please check your team's approval and ensure all members have approved the pitch."
              : "Pitch is ready but not yet submitted."}
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
