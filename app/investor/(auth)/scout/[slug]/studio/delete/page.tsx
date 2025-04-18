"use client";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import formatDate from "@/lib/formatDate";
import { X, MinusCircle, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  isUser?: boolean;
  designation: string;
  daftar: string;
  status: "approved" | "pending" | "rejected" | "not_requested";
}

interface ApiUser {
  scoutId: string;
  isAgreed: boolean | null;
  investorId: string;
  agreedAt: string | null;
  daftarName: string | null;
  designation: string | null;
  user: {
    name: string | null;
    lastName: string | null;
    email: string | null;
    role: string | null;
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <Check className="h-5 w-5 text-green-500" />;
    case "rejected":
      return <X className="h-5 w-5 text-destructive" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function DeletePage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const { toast } = useToast();
  const deletionDate = new Date().toISOString();
  const [approvals, setApprovals] = useState<TeamMember[]>([]);
  const [userConsent, setUserConsent] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [currentUserApproved, setCurrentUserApproved] = useState<
    boolean | null
  >(null);

  // Fetch team approvals from /api/endpoints/scouts/delete
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await fetch(
          `/api/endpoints/scouts/delete?scoutId=${scoutId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        const { listOfUsers, currentUserApprovalStatus } = data;

        const mappedApprovals: TeamMember[] = listOfUsers.map(
          (entry: ApiUser) => ({
            name: entry.user.name
              ? `${entry.user.name} ${entry.user.lastName || ""}`.trim()
              : "Unknown User",
            email: entry.user.email || "N/A",
            role: entry.user.role || "N/A",
            isApproved: entry.isAgreed || false,
            isUser: entry.investorId === currentUserApprovalStatus?.investorId,
            designation: entry.designation || "N/A",
            daftar: entry.daftarName || "Unknown Daftar",
            status: entry.isAgreed
              ? "approved"
              : entry.agreedAt
              ? "pending"
              : "not_requested",
          })
        );

        setApprovals(mappedApprovals);
        setCurrentUserApproved(currentUserApprovalStatus);
      } catch (error) {
        console.error("Error fetching approvals:", error);
        toast({
          title: "Error",
          description: "Failed to load team approvals",
          variant: "destructive",
        });
      }
    };

    if (scoutId) {
      fetchApprovals();
    }
  }, [scoutId, toast]);

  const handleDelete = async () => {
    if (!userConsent) return;

    try {
      // Send approval to POST /api/scout-documents
      const response = await fetch("/api/endpoints/scouts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoutId,
          isAgreed: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      // Update local state
      setApprovals((prev) =>
        prev.map((member) =>
          member.isUser
            ? { ...member, isApproved: true, status: "approved" }
            : member
        )
      );
      setCurrentUserApproved(true);
      setDeleteClicked(true);
      toast({
        title: "Approval submitted",
        description: "Your approval for scout deletion has been recorded",
      });
    } catch (error) {
      console.error("Error submitting approval:", error);
      toast({
        title: "Error",
        description: "Failed to submit approval",
        variant: "destructive",
      });
    }
  };

  const pendingApprovals = approvals.filter(
    (member) => !member.isApproved
  ).length;

  return (
    <div className="flex px-5 mt-10 container mx-auto gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          <div className="flex flex-col p-4 rounded-lg space-y-6">
            {/* Initial Warning */}
            <p className="text-sm text-muted-foreground">
              All data related to the scout will be deleted, and the offer will
              be withdrawn. An email will be sent to all stakeholders to notify
              them of this change
            </p>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="user-consent"
                checked={userConsent}
                onCheckedChange={(checked: boolean) =>
                  setUserConsent(checked as boolean)
                }
                className="h-5 w-5 mt-0.5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              />
              <label
                htmlFor="user-consent"
                className="text-sm text-muted-foreground"
              >
                I agree to delete the scout
              </label>
            </div>

            {/* Delete Button */}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!userConsent || deleteClicked}
              className="w-[12%] bg-muted rounded-[0.35rem] hover:bg-muted/50"
            >
              Delete
            </Button>

            {deleteClicked && (
              <>
                {/* Team Approvals Section */}
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      Team's Approval Required
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {approvals.filter((a) => a.isApproved).length} of{" "}
                      {approvals.length}
                    </div>
                  </div>

                  <div>
                    {approvals.map((member) => (
                      <div
                        key={member.email}
                        className="flex items-center justify-between p-4 border rounded-lg bg-background"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.designation}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.daftar}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(member.status)}
                        </div>
                      </div>
                    ))}
                    <div className="pt-4">
                      <span className="text-xs text-muted-foreground">
                        <strong>Deleted Scout On</strong> <br />{" "}
                        {formatDate(deletionDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
