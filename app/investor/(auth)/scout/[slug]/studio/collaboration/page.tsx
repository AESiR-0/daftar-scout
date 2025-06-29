"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import formatDate from "@/lib/formatDate";
import { X, Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { InvestorProfile } from "@/components/InvestorProfile";
import { usePathname, useSearchParams } from "next/navigation";
import ReactPlayer from "react-player";
import { useIsScoutLocked } from "@/contexts/isScoutLockedContext";

type CollaborationStatus = "Pending" | "Accepted" | "Declined";

interface Collaborator {
  id: string;
  daftarId: string;
  daftarName: string;
  status: CollaborationStatus;
  addedAt: string;
  daftarDetails: {
    structure: string;
    website: string;
    location: string;
    bigPicture: string;
  };
}

export default function CollaborationPage() {
  const { toast } = useToast();
  const [daftarId, setDaftarId] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [removingCollaborator, setRemovingCollaborator] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scoutId = pathname.split("/")[3];
  const { isLocked, isLoading: isLockLoading } = useIsScoutLocked();

  // Check for action parameters from email links
  const action = searchParams.get("action");
  const actionDaftarId = searchParams.get("daftarId");

  useEffect(() => {
    if (isLocked) {
      toast({
        title: "Scout is Locked",
        description: "This scout is not in planning stage anymore and cannot be modified.",
        variant: "destructive",
      });
    }
  }, [isLocked, toast]);

  // Handle action from email link
  useEffect(() => {
    if (action && actionDaftarId && !processingAction) {
      handleEmailAction(action, actionDaftarId);
    }
  }, [action, actionDaftarId, processingAction]);

  const fetchCollaborators = async () => {
    try {
      const res = await fetch(
        `/api/endpoints/scouts/collaboration?scoutId=${scoutId}`
      );
      const data = await res.json();

      // Map DB structure to UI structure
      const formatted: Collaborator[] = data.map((item: any) => ({
        id: item.id,
        daftarId: item.daftarId,
        daftarName: item.daftarName || "Unknown Daftar",
        status: item.isPending ? "Pending" : "Accepted",
        addedAt: item.createdAt || new Date().toISOString(),
        daftarDetails: {
          structure: item.daftarStructure || "Unknown",
          website: item.daftarWebsite || "N/A",
          location: item.daftarLocation || "N/A",
          bigPicture: item.daftarBigPicture || "No description",
        },
      }));

      setCollaborators(formatted);
    } catch (error) {
      toast({
        title: "Error fetching collaborators",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleEmailAction = async (actionType: string, daftarId: string) => {
    if (!["accept", "reject"].includes(actionType)) return;

    setProcessingAction(true);
    try {
      const response = await fetch("/api/endpoints/scouts/collaboration/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scoutId,
          daftarId,
          action: actionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process action");
      }

      toast({
        title: `Collaboration ${actionType === 'accept' ? 'Accepted' : 'Rejected'}`,
        description: `You have successfully ${actionType}ed the collaboration request.`,
      });

      // Refresh collaborators list
      await fetchCollaborators();

      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to scout page after successful action
      setTimeout(() => {
        window.location.href = `/investor/scout`;
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const handleInvite = async () => {
    if (daftarId.length !== 6) {
      toast({
        title: "Invalid Daftar ID",
        description: "Please enter a valid 6-character Daftar ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsInviting(true);
      const res = await fetch("/api/endpoints/scouts/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoutId, daftarId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to invite");
      }

      toast({
        title: "Invitation sent",
        description: `Invitation sent to Daftar ${daftarId}`,
      });

      setCollaborators((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          daftarId,
          daftarName: "tech innovators",
          status: "Pending",
          addedAt: new Date().toISOString(),
          daftarDetails: {
            structure: "Government Incubator",
            website: "www.example.com",
            location: "Mumbai, India",
            bigPicture:
              "Building the next generation of financial infrastructure",
          },
        },
      ]);

      setDaftarId("");
    } catch (error: any) {
      toast({
        title: "Failed to send invite",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const removeCollaborator = async (id: string) => {
    try {
      setRemovingCollaborator(id);
      const res = await fetch(
        `/api/endpoints/scouts/collaboration?scoutId=${scoutId}&collaboratorId=${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove collaborator");
      }

      // Remove from local state
      setCollaborators(collaborators.filter((c) => c.id !== id));

      toast({
        title: "Collaborator removed",
        description: "Collaborator has been successfully removed from the scout.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove collaborator",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRemovingCollaborator(null);
    }
  };

  if (isLockLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (processingAction) {
    return (
      <div className="container px-4 mt-4 mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Processing your request...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we handle your collaboration action.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 mt-4 mx-auto py-6">
      {isLocked && (
        <div className="flex items-center gap-2 text-destructive mb-4">
          <Lock className="h-5 w-5" />
          <p className="text-sm font-medium">The scout is locked. You can not make any changes to it.</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Collaborators (2/3 width) */}
        <div className="col-span-2">
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="space-y-6">
              {/* Invite Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Daftar ID"
                  value={daftarId}
                  onChange={(e) => setDaftarId(e.target.value.toUpperCase())}
                  maxLength={6}
                  disabled={isLocked || isInviting}
                />
                <Button
                  onClick={handleInvite}
                  variant="outline"
                  disabled={isLocked || isInviting}
                >
                  {isInviting ? "Inviting..." : "Invite"}
                </Button>
              </div>

              {/* Collaborators List or Empty State */}
              <div className="space-y-4">
                {collaborators.length > 0 ? (
                  collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-background"
                    >
                      <div>
                        <InvestorProfile
                          investor={{
                            daftarName: collaborator.daftarName,
                            structure: collaborator.daftarDetails.structure,
                            website: collaborator.daftarDetails.website,
                            location: collaborator.daftarDetails.location,
                            bigPicture: collaborator.daftarDetails.bigPicture,
                            onDaftarSince: collaborator.addedAt,
                          }}
                        />
                        <p className="text-xs text-muted-foreground">

                          {collaborator.status == 'Pending' ?
                            `  Status: ${collaborator.status}`
                            : `On Scout Since`
                          }
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {formatDate(collaborator.addedAt)}
                        </p>
                      </div>
                      {/* Only show cross button if there are multiple collaborators */}
                      {collaborators.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCollaborator(collaborator.id)}
                          disabled={isLocked || removingCollaborator === collaborator.id}
                        >
                          {removingCollaborator === collaborator.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-4">
                    <h4 className="text-sm font-semibold mb-4">
                      About Collaboration
                    </h4>
                    <p>
                      A collaborator helps your Scout connect with the right
                      partners in a specific location and reach a larger
                      audience.
                      <br />
                      <br />
                      Since they've been working in the area for a long time,
                      they understand the local ecosystem and speak the language
                      founders speak.
                      <br />
                      <br />
                      They're typically incubators, accelerators, angels,
                      founder's offices, or VCs with strong local networks.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Support (1/3 width) */}
        <div>
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="space-y-6">
              {/* Video at the Top */}
              <div className="w-full">
                <ReactPlayer
                  url="example.mp4"
                  width="100%"
                  height="auto"
                  style={{
                    borderRadius: "0.35rem",
                  }}
                  controls
                />
              </div>

              <h3 className="text-lg font-semibold">Support</h3>
              <p className="text-sm text-muted-foreground">
                Looking for the right collaborator? Whether you have someone in
                mind or need help finding the perfect match, Daftar's got you
                covered.
                <br />
                <br />
                Schedule a quick call with us, and we'll help you figure it out.
              </p>

              <div className="space-y-4">
                <Textarea
                  placeholder="How can we help you?"
                  className="h-24"
                  disabled={isLocked}
                />
                <Input
                  placeholder="When should we call you? e.g. 2:00 PM IST"
                  disabled={isLocked}
                />
                <div className="flex gap-2">
                  <Input
                    className="w-20"
                    placeholder="+91"
                    disabled={isLocked}
                  />
                  <Input
                    className="flex-1"
                    placeholder="Enter phone number"
                    disabled={isLocked}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isLocked}
                >
                  Schedule a Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
