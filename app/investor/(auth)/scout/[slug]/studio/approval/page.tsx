"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Clock, MinusCircle, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface ApprovalRequest {
  scoutId: string;
  isApproved: boolean;
  investorId: string;
  approvedAt: Date;
  daftarName: string;
  designation: string;
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

  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [userApproved, setUserApproved] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
        } = data;

        setApprovalRequests(listOfUsers);
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
    try {
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
        return;
      }

      toast({
        title: "Scout Approved",
        description: "Your approval has been submitted successfully",
      });
    } catch {
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

  return (
    <div className="flex">
      <div className="container mx-auto px-5 mt-2">
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
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground"
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
                      !termsAccepted || userApproved || issues.length > 0
                    }
                    onClick={handleApprove}
                  >
                    Approve Scout
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {!userApproved && (
                      <h3 className="text-sm font-medium">
                        Team's Approval Required
                      </h3>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {approvedCount} of {totalMembers}
                    </div>
                  </div>

                  <div>
                    {approvalRequests?.map((member) => (
                      <div
                        key={member.investorId}
                        className="flex items-center justify-between p-4 border rounded-lg bg-background"
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
