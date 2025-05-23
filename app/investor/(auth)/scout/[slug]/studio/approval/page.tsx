"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Clock, MinusCircle, AlertCircle, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";
import { useIsScoutLocked } from "@/contexts/isScoutLockedContext";

interface ApprovalRequest {
  scoutId: string;
  isApproved: boolean;
  investorId: string;
  approvedAt: Date;
  daftarName: string;
  designation: string;
  isCurrentUser?: boolean;
  user: {
    name: string;
    lastName: string;
    email: string;
  };
}

const getStatusIcon = (status: boolean) => {
  switch (status) {
    case true:
      return <Check className="h-5 w-5 text-green-500" />;
    case false:
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function ApprovalPage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const { isLocked, isLoading: isLockLoading } = useIsScoutLocked();

  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [userApproved, setUserApproved] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLocked) {
      toast({
        title: "Scout is Locked",
        description: "This scout is not in planning stage anymore and cannot be modified.",
        variant: "destructive",
      });
    }
  }, [isLocked]);

  useEffect(() => {
    const fetchScoutStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/endpoints/scouts/pending?scoutId=${scoutId}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch");

        const {
          listOfUsers,
          currentUserApprovalStatus,
          issues: issueList = [],
          currentUserId,
        } = data;

        // Mark current user in the list
        const updatedUsers = listOfUsers.map((user: ApprovalRequest) => ({
          ...user,
          isCurrentUser: user.investorId === currentUserId
        }));

        setApprovalRequests(updatedUsers);
        setUserApproved(currentUserApprovalStatus === true);
        setIssues(issueList);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error fetching Scout data",
          description: (error as Error).message,
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchScoutStatus();
  }, [scoutId]);

  const handleApprove = async () => {
    if (!termsAccepted || userApproved || issues.length > 0) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/endpoints/scouts/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoutId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Approval Failed",
          description: data.error || "Something went wrong.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Update local state
      setUserApproved(true);
      setApprovalRequests(prev => 
        prev?.map(request => 
          request.isCurrentUser 
            ? { ...request, isApproved: true, approvedAt: new Date() }
            : request
        )
      );

      toast({
        title: "Scout Approved",
        description: data.isApprovedByAll 
          ? "Your approval has been submitted and the scout is now active!"
          : "Your approval has been submitted successfully",
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Network Error",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const totalMembers = approvalRequests?.length || 0;
  const approvedCount =
    approvalRequests?.filter((req) => req.isApproved).length || 0;

  if (isLockLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="flex">
      <div className="container mx-auto px-5 mt-2">
        {isLocked && (
          <div className="flex items-center gap-2 text-destructive mb-4">
            <Lock className="h-5 w-5" />
            <p className="text-sm font-medium">The scout is not in planning stage anymore</p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2">
            <Card className="border-none bg-[#0e0e0e]">
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col space-y-6">
                  {!userApproved && (
                    <div className="flex items-center mt-4 space-x-2">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        className="h-5 w-5 mt-0.5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                        onCheckedChange={(checked: boolean) =>
                          setTermsAccepted(checked as boolean)
                        }
                        disabled={loading || issues.length > 0 || isLocked}
                      />
                      <label
                        htmlFor="terms"
                        className={`text-sm text-muted-foreground ${
                          issues.length > 0 || isLocked ? "opacity-50" : ""
                        }`}
                      >
                        All the data looks good to me. We can take the Scout
                        live.
                      </label>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-fit rounded-[0.3rem]"
                    disabled={
                      !termsAccepted || userApproved || issues.length > 0 || loading || isLocked
                    }
                    onClick={handleApprove}
                  >
                    {loading ? "Processing..." : "Approve Scout"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      {userApproved
                        ? "Team's Approval Status"
                        : "Team's Approval Required"}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {approvedCount} of {totalMembers} approved
                    </div>
                  </div>

                  <div className="space-y-3">
                    {approvalRequests?.map((member) => (
                      <div
                        key={member.investorId}
                        className={`flex items-center justify-between p-4 border rounded-lg bg-background ${
                          member.isCurrentUser ? "border-primary/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {member.user.name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {member.user.name} {member.user.lastName}
                              {member.isCurrentUser && (
                                <span className="ml-2 text-xs text-primary">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.designation}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.daftarName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(member.isApproved)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Review Issues */}
          <div className="mt-2">
            <Card className="border-none bg-[#0e0e0e] shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Review Required
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {issues.length > 0 ? (
                    <>
                      <ul className="space-y-3">
                        {issues.map((issue, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 p-3 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors cursor-pointer"
                          >
                            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground">
                              {issue}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        Please address these issues before approving the Scout.
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-foreground">No issues found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Everything looks good for approval.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
