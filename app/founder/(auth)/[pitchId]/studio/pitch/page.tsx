"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Check, Clock, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentDialog } from "@/components/dialogs/payment-dialog";
import formatDate from "@/lib/formatDate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { usePitch } from "@/contexts/PitchContext";

interface ApprovalRequest {
  id: string;
  username: string;
  designation: string;
  date: string;
  status: "approved" | "pending";
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <Check className="h-5 w-5 text-green-500" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

const initialApprovalRequests: ApprovalRequest[] = [
  {
    id: "1",
    username: "John Smith",
    designation: "Co-Founder & CTO",
    date: formatDate("2024-03-20T14:30:00"),
    status: "approved",
    profile: {
      name: "John Smith",
      age: "30",
      gender: "Male",
      email: "john.smith@example.com",
      phone: "1234567890",
      location: "New York, NY",
      language: ["English", "Tamil"],
      designation: "Co-Founder & CTO",
    },
  },
  {
    id: "2",
    username: "Sarah Johnson",
    designation: "Product Lead",
    date: formatDate("2024-03-19T10:15:00"),
    status: "pending",
    profile: {
      name: "Sarah Johnson",
      age: "28",
      gender: "Female",
      email: "sarah.johnson@example.com",
      designation: "Product Lead",
      phone: "0987654321",
      language: ["English", "Spanish"],
      location: "San Francisco, CA",
    },
  },
  {
    id: "3",
    username: "Michael Chen",
    designation: "Technical Advisor",
    date: formatDate("2024-03-18T16:45:00"),
    status: "approved",
    profile: {
      name: "Michael Chen",
      age: "35",
      gender: "Male",
      email: "michael.chen@example.com",
      phone: "0987654321",
      designation: "Technical Advisor",
      language: ["English", "Chinese"],
      location: "San Francisco, CA",
    },
  },
];

export default function PitchPage() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { pitchId } = usePitch(); // Get pitchId from context
  const [specificAsks, setSpecificAsks] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(initialApprovalRequests);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId] = useState("1"); // Demo: John Smith as current user

  // Fetch pitch details on mount
  useEffect(() => {
    if (pitchId) {
      fetchPitchDetails();
    }
  }, [pitchId]);

  const fetchPitchDetails = async () => {
    try {
      const response = await fetch("/api/endpoints/pitch/founder/pitch", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(pitchId && { "pitch_id": pitchId }) // Conditionally add pitch_id
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pitch details");
      const data = await response.json();
      setSpecificAsks(data.askForInvestor || "");
      // Note: Team approvals could be fetched from a separate endpoint if server-side
    } catch (error) {
      console.error("Error fetching pitch details:", error);
      toast({
        title: "Error",
        description: "Failed to load pitch details",
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
  const handleApprovalToggle = (requestId: string) => {
    if (requestId !== currentUserId) return;

    setApprovalRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: req.status === "approved" ? "pending" : "approved",
              date: formatDate(new Date().toISOString()),
            }
          : req
      )
    );
    // Optionally save to server here with a separate endpoint
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
  const approvedCount = approvalRequests.filter((req) => req.status === "approved").length;

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
              onBlur={savePitchDetails} // Save on blur
              className="min-h-[100px] bg-muted/50 resize-none rounded-xl"
            />
          </div>

          {/* Team Approvals Section */}
          <div className="flex items-center mt-4 px-1 space-x-2 mb-4">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              className="h-5 w-5 mt-0.5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              onCheckedChange={(checked: boolean) => {
                setTermsAccepted(checked);
                savePitchDetails(); // Save status change
              }}
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm that this pitch is ready for team approval and submission
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
              {approvalRequests.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-background"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.username}</p>
                      <p className="text-xs text-muted-foreground">{member.designation}</p>
                    </div>
                  </div>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleApprovalToggle(member.id)}
                  >
                    {getStatusIcon(member.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Section: Action & Errors */}
      <div className="w-1/3 pl-6 space-y-6">
        <Button
          className="w-full rounded-[0.35rem] bg-muted hover:bg-muted/50"
          size="lg"
          onClick={handlePitchSubmission}
          disabled={isLoading || !termsAccepted || approvedCount < totalMembers}
        >
          {isLoading ? "Submitting..." : "Pitch Now"}
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

      <PaymentDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog} />
    </div>
  );
}