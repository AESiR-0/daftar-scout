"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/format-date";
import { Clock, MinusCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePitch } from "@/contexts/PitchContext";

interface TeamMember {
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  status: "pending" | "approved";
  isUser?: boolean;
  age: string;
  phone: string;
  gender: string;
  location: string;
  designation: string;
  language: string[];
  imageUrl?: string;
  date?: string;
  founderId: string; // Added for API integration
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

export default function DeletePage() {
  const { pitchId } = usePitch(); // Get pitchId from context
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<TeamMember[]>([]);
  const [userConsent, setUserConsent] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dummy current user (replace with auth system)
  const currentUser = {
    founderId: "user_1", // Example ID
    name: "John Doe",
    email: "john@example.com",
    role: "You",
    age: "28",
    phone: "+91 9876543210",
    gender: "Male",
    location: "Bangalore, India",
    designation: "Founder",
    language: ["English", "Hindi"],
  };

  useEffect(() => {
    if (pitchId) {
      fetchDeleteRequests();
    }
  }, [pitchId]);

  const fetchDeleteRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/delete", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(pitchId && { "pitch-id": pitchId }),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch delete requests");
      const data = await response.json();

      // Map API data to TeamMember interface (dummy team data for now)
      const teamMembers: TeamMember[] = [
        {
          ...currentUser,
          isApproved: false,
          status: "pending",
          isUser: true,
          date: new Date().toISOString(),
          founderId: currentUser.founderId,
        },
        {
          name: "Jane Smith",
          email: "jane@example.com",
          role: "Team Member",
          age: "32",
          phone: "+91 9876543211",
          gender: "Female",
          location: "Mumbai, India",
          designation: "CTO",
          language: ["English", "Marathi"],
          isApproved: false,
          status: "pending",
          isUser: false,
          date: new Date().toISOString(),
          founderId: "user_2", // Example ID
        },
      ];

      // Update with API data
      const updatedApprovals = teamMembers.map((member) => {
        const request = data.find((req: any) => req.founder_id === member.founderId);
        return {
          ...member,
          isApproved: request ? request.is_agreed : false,
          status: request && request.is_agreed ? "approved" as const : "pending" as const,
        };
      });

      setApprovals(updatedApprovals);
    } catch (error) {
      console.error("Error fetching delete requests:", error);
      toast({
        title: "Error",
        description: "Failed to load deletion requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userConsent || !pitchId) {
      toast({
        title: "Error",
        description: "Please agree to delete and ensure a pitch is selected",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId,
          founderId: currentUser.founderId,
          isAgreed: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process delete request");
      }

      setApprovals((prev) =>
        prev.map((member) =>
          member.isUser
            ? { ...member, isApproved: true, status: "approved" }
            : member
        )
      );
      setDeleteClicked(true);

      toast({
        title: "Success",
        description: "Your approval for deletion has been recorded",
      });

      // Check if all approvals are received
      const allApproved = approvals.every((member) => member.isApproved);
      if (allApproved) {
        // Trigger full pitch deletion here (not implemented in provided endpoint)
        toast({
          title: "Pitch Deleted",
          description: "All team members approved; pitch has been deleted.",
        });
      }
    } catch (error: any) {
      console.error("Error processing delete request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process delete request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pendingApprovals = approvals.filter((member) => !member.isApproved).length;

  return (
    <div className="flex px-5 mt-14 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          <div className="flex flex-col p-4 rounded-lg space-y-6">
            <p className="text-sm text-muted-foreground">
              All data related to the pitch will be deleted, and the offer will be withdrawn.
              An email will be sent to all stakeholders to notify them of this change.
            </p>

            <div className="flex items-start gap-2">
              <Checkbox
                id="user-consent"
                checked={userConsent}
                onCheckedChange={(checked: boolean) => setUserConsent(checked)}
                className="h-5 w-5 mt-0.5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              />
              <label htmlFor="user-consent" className="text-sm text-muted-foreground">
                I agree to delete the pitch
              </label>
            </div>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!userConsent || deleteClicked || isLoading}
              className="w-[12%] bg-muted hover:bg-muted/50"
            >
              {isLoading ? "Processing..." : "Delete"}
            </Button>

            {deleteClicked && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Team's Approval Required</h3>
                  <div className="text-sm text-muted-foreground">
                    {approvals.filter((a) => a.isApproved).length} of {approvals.length}
                  </div>
                </div>

                <div>
                  {approvals.map((member) => (
                    <div
                      key={member.founderId}
                      className="flex items-center justify-between p-4 border rounded-lg bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.designation}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(member.status)}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <span className="text-xs text-muted-foreground">
                      <strong>Deletion Requested On</strong> <br />{" "}
                      {formatDate(new Date().toISOString())}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}