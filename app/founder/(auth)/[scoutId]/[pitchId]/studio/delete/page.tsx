"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/format-date";
import { Clock, MinusCircle, Check, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

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
  founderId: string;
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
  const pathname = usePathname();
  const pitchId = pathname.split("/")[3];
  const scoutId = pathname.split("/")[2];
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<TeamMember[]>([]);
  const [userConsent, setUserConsent] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const isDemoPitch = pitchId === "HJqVubjnQ3RVGzlyDUCY4";

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/endpoints/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }

      const userData = await response.json();
      
      // Transform API user data to match TeamMember interface
      const transformedUser: TeamMember = {
        name: userData.name || 'Demo User',
        email: userData.email || 'demo@example.com',
        role: userData.role || 'Founder',
        designation: userData.designation || 'Founder',
        isApproved: false,
        status: 'pending',
        isUser: true,
        age: userData.age || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        location: userData.location || '',
        language: userData.language || ['English'],
        founderId: userData.id || 'demo-user-id'
      };

      setCurrentUser(transformedUser);
      return transformedUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user data',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    if (isDemoPitch) {
      const setupDemoPitch = async () => {
        setIsLoading(true);
        try {
          // Fetch current user data
          const user = await fetchCurrentUser();
          
          if (user) {
            // Set dummy approvals with the fetched user data
            const dummyApprovals: TeamMember[] = [
              user,
              {
                name: "Team Member 1",
                email: "member1@example.com",
                role: "Co-Founder",
                designation: "Co-Founder",
                isApproved: false,
                status: "pending",
                age: "28",
                phone: "+1234567891",
                gender: "Female",
                location: "Demo City",
                language: ["English"],
                founderId: "member1-id"
              }
            ];
            setApprovals(dummyApprovals);

            // Show demo pitch toast
            toast({
              title: "Demo Pitch",
              description: "This is a demo pitch and cannot be edited.",
              variant: "default"
            });
          }
        } catch (error) {
          console.error('Error setting up demo pitch:', error);
        } finally {
          setIsLoading(false);
        }
      };

      setupDemoPitch();
    } else if (pitchId && scoutId) {
      fetchDeleteRequests();
    }
  }, [pitchId, scoutId, isDemoPitch]);

  // Show locked toast when pitch becomes locked

  const fetchDeleteRequests = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log('Fetching delete requests for:', { pitchId, scoutId });

      const response = await fetch(`/api/endpoints/pitch/founder/delete?pitchId=${pitchId}&scoutId=${scoutId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(`Failed to fetch delete requests: ${response.status} - ${data.message || 'Unknown error'}`);
      }

      if (!data || typeof data !== 'object') {
        throw new Error(`Invalid response data: ${JSON.stringify(data)}`);
      }

      // Get team members and current user from response
      const { teamMembers, currentUser: apiCurrentUser } = data;

      if (!Array.isArray(teamMembers)) {
        throw new Error('Expected teamMembers array in response');
      }

      console.log('Processing team members:', teamMembers);

      // Transform API data to match our interface
      const processedMembers = teamMembers.map((member: {
        name: string;
        email: string;
        userId: string;
        designation: string;
        hasApproved: boolean;
        isApproved: boolean;
        status: "pending" | "approved";
      }): TeamMember => {
        const memberData: TeamMember = {
          name: member.name,
          email: member.email,
          role: member.designation,
          designation: member.designation,
          isApproved: member.isApproved,
          status: member.status,
          founderId: member.userId,
          // Default values for required fields
          age: "",
          phone: "",
          gender: "",
          location: "",
          language: [],
          // Mark as current user if IDs match
          isUser: apiCurrentUser?.id === member.userId
        };

        // Set current user if this is the current user
        if (memberData.isUser) {
          console.log('Found current user:', memberData);
          setCurrentUser(memberData);
        }

        return memberData;
      });

      console.log('Final team members:', processedMembers);
      setApprovals(processedMembers);

      // If all approvals are received, show success message
      const allApproved = processedMembers.every((member: TeamMember) => member.isApproved);
      if (allApproved && deleteClicked) {
        toast({
          title: "All Approvals Received",
          description: "The pitch can now be deleted.",
        });
      }
    } catch (error) {
      console.error("Error fetching delete requests:", {
        error,
        pitchId,
        scoutId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load deletion requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch and cannot be edited.",
        variant: "default"
      });
      return;
    }

    if (!userConsent || !pitchId || !scoutId || !currentUser) {
      toast({
        title: "Error",
        description: "Please agree to delete and ensure all required information is available",
        variant: "destructive",
      });
      return;
    }

    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/endpoints/pitch/founder/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId,
          scoutId,
          founderId: currentUser.founderId,
          isAgreed: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process delete request");
      }

      await response.json();

      setApprovals((prev) =>
        prev.map((member: TeamMember) =>
          member.founderId === currentUser.founderId
            ? { ...member, isApproved: true, status: "approved" }
            : member
        )
      );
      setDeleteClicked(true);

      toast({
        title: "Success",
        description: "Your approval for deletion has been recorded",
      });

      // Refresh the approval status
      await fetchDeleteRequests();

    } catch (error: any) {
      console.error("Error processing delete request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process delete request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoading) {
    return null; // Or loading state
  }

  const pendingApprovals = approvals.filter((member) => !member.isApproved).length;

  return (
    <div className="flex px-5 mt-14 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          <div className="flex flex-col p-4 rounded-lg space-y-6">
            {isDemoPitch && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-500">
                  This is a demo pitch. All actions are disabled.
                </p>
              </div>
            )}

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
                disabled={isDeleting || isDemoPitch}
              />
              <label htmlFor="user-consent" className="text-sm text-muted-foreground">
                I agree to delete the pitch
              </label>
            </div>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                isDemoPitch ||
                !userConsent ||
                isDeleting ||
                (deleteClicked && approvals.find(m => m.founderId === currentUser?.founderId)?.isApproved)
              }
              className="w-[12%] rounded-[0.35rem]"
            >
              {isDeleting ? "Processing..." : deleteClicked ? "Approved" : "Delete"}
            </Button>

            {deleteClicked && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Team's Approval Required</h3>
                  <div className="text-sm text-muted-foreground">
                    {approvals.filter((a) => a.isApproved).length} of {approvals.length} approved
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
                          <p className="text-sm font-medium">
                            {member.name} {member.isUser && "(You)"}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.designation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {member.status === "approved" ? "Approved" : "Pending"}
                        </span>
                        {getStatusIcon(member.status)}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <span className="text-xs text-muted-foreground">
                      <strong>Deletion Requested On</strong> <br />
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