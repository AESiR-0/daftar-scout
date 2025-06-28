"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MapPin, X, Phone, Pencil, Check, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePitch } from "@/contexts/PitchContext"; // Import context hook
import { usePathname, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string;
  userId: string;
  pitchId: string;
  designation: string;
  firstName: string;
  lastName: string | null;
  email: string;
  gender: string | null;
  location: string | null;
  language: string[];
  image: string | null;
  countryCode: string | null;
  phone: string | null;
  joinDate: string;
  status: "active" | "pending";
  isCurrentUser?: boolean;
}

export default function TeamPage() {
  const { toast } = useToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pitchId = pathname.split("/")[3];
  const isDemoPitch = pitchId === "HJqVubjnQ3RVGzlyDUCY4";

  // Check for action parameters from email links
  const action = searchParams.get("action");
  const token = searchParams.get("token");

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return firstName?.[0] + (lastName?.[0] || "");
  };

  const formatPhoneNumber = (phone: string) => {
    const match = phone?.match(/^(.+?)(\d{10})$/);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    return phone;
  };

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
    }
  }, [isDemoPitch, toast]);

  // Handle action from email link
  useEffect(() => {
    if (action && token && !processingAction) {
      handleEmailAction(action, token);
    }
  }, [action, token, processingAction]);

  const fetchTeamMembers = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `/api/endpoints/pitch/founder/team?pitchId=${pitchId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch team members");
      const { data } = await response.json();

      // Get the current user's email from the session
      const currentUserEmail = await fetch("/api/auth/session").then(res => res.json()).then(session => session?.user?.email);

      const enrichedMembers = data.map((member: TeamMember) => ({
        ...member,
        firstName: member.firstName || "Unknown",
        lastName: member.lastName || "",
        isCurrentUser: member.email === currentUserEmail,
      }));

      setMembers(enrichedMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleEmailAction = async (actionType: string, token: string) => {
    if (!["accept", "reject"].includes(actionType)) return;
    
    setProcessingAction(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/team/action", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pitchId,
          action: actionType === 'accept' ? 'accepted' : 'declined',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process action");
      }

      toast({
        title: `Pitch Team Invitation ${actionType === 'accept' ? 'Accepted' : 'Rejected'}`,
        description: `You have successfully ${actionType}ed the pitch team invitation.`,
      });

      // Refresh team members list
      await fetchTeamMembers();
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect to pitch page after successful action
      setTimeout(() => {
        window.location.href = `/founder/${pathname.split("/")[2]}/${pitchId}/studio/pitch`;
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
    if (pitchId) {
      fetchTeamMembers();
    }
  }, [pitchId]);

  const handleInvite = async () => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }

    if (
      !newMember.firstName ||
      !newMember.lastName ||
      !newMember.email ||
      !newMember.designation
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId,
          email: newMember.email, // Placeholder
          designation: newMember.designation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add team member");
      }

      const { data } = await response.json();
      const newTeamMember = {
        ...data,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        email: newMember.email,
        age: "Not Specified",
        gender: "Not Specified",
        location: "Not Specified",
        language: ["English"],
        status: "pending",
        joinDate: new Date().toISOString().split("T")[0],
        phone: "To be added",
      };

      setMembers([...members, newTeamMember]);
      setNewMember({
        firstName: "",
        lastName: "",
        email: "",
        designation: "",
      });
      toast({
        title: "Success",
        description: "Team member invited successfully",
      });
    } catch (error: any) {
      console.error("Error inviting team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite team member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvite = (id: string) => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }
    setMembers(members.filter((member) => member.id !== id));
  };

  const handleRemoveMember = (id: string) => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }
    setMembers(members.filter((member) => member.id !== id));
  };

  const handleWithdraw = () => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }
    console.log("Withdrawing from team");
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editDesignation, setEditDesignation] = useState("");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleStartEditing = (member: TeamMember) => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }
    setEditingMember(member);
    setEditDesignation(member.designation);
    setIsEditing(true);
  };

  const handleSaveDesignation = async () => {
    if (isDemoPitch) {
      toast({
        title: "Demo Pitch",
        description: "This is a demo pitch, no data can be changed",
        variant: "destructive",
      });
      return;
    }
    if (!editingMember || !editDesignation.trim()) return;

    try {
      const response = await fetch("/api/endpoints/pitch/founder/team/designation", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pitchId,
          userId: editingMember.userId,
          designation: editDesignation.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update designation");
      }

      // Update the members list with the new designation
      setMembers(members.map(member =>
        member.id === editingMember.id
          ? { ...member, designation: editDesignation.trim() }
          : member
      ));

      toast({
        title: "Success",
        description: "Designation updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating designation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update designation",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
      setEditingMember(null);
      setEditDesignation("");
    }
  };

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  if (processingAction) {
    return (
      <div className="space-y-4 px-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Processing your request...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we handle your pitch team action.</p>
          </div>
        </div>
      </div>
    );
  }

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-[0.35rem]">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Avatar className="h-48 w-48 rounded-[0.35rem]">
            {member.image ? (
              <AvatarImage
                src={member.image}
                alt={member.firstName}
                className="rounded-[0.35rem]"
              />
            ) : (
              <AvatarFallback className="rounded-[0.35rem] text-xl">
                {getInitials(`${member.firstName} ${member.lastName || ""}`)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-medium">
                {member.firstName} {member.lastName || ""}
              </h4>
            </div>
            <div className="space-y-2 mt-2">
              <div className="space-y-1 text-sm text-muted-foreground">
                {isEditing && member.isCurrentUser ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="h-8"
                      placeholder="Enter your designation"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveDesignation}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {member.designation}
                  </p>
                )}
                {member.gender && (
                  <div className="flex items-center gap-2">
                    <span>{member.gender}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <p>{member.email}</p>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <p>{member.countryCode} {' '} {formatPhoneNumber(member.phone)}</p>
                  </div>
                )}
                {member.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <p>{member.location}</p>
                  </div>
                )}
                {member.language && member.language.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Preferred languages: {member.language.join(", ")}
                  </p>
                )}
                {member.joinDate && (
                  <p className="text-sm text-muted-foreground">
                    Joined: {formatDate(member.joinDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {member.isCurrentUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStartEditing(member)}
              className="h-8 w-8"
              disabled={isDemoPitch}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {member.isCurrentUser ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWithdraw}
              className="h-8 w-8"
              disabled={isDemoPitch}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMember(member.id)}
              className="h-8 w-8"
              disabled={isDemoPitch}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const PendingCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-[0.35rem]">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">
                {member.firstName} {member.lastName || ""}
              </h4>
              {member.isCurrentUser && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  You
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {member.designation}
            </p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCancelInvite(member.id)}
          className="text-red-500 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const LoadingMemberCard = () => (
    <div className="bg-[#1a1a1a] p-6 rounded-[0.35rem]">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Skeleton className="h-48 w-48 rounded-[0.35rem]" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 px-10">
      {!pitchId && (
        <p className="text-sm text-muted-foreground">
          Create a pitch first to manage your team.
        </p>
      )}
      {pitchId && (
        <>
          <div className="bg-[#1a1a1a] rounded-[0.35rem] p-6 mt-8">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={newMember.firstName}
                onChange={(e) =>
                  !isDemoPitch && setNewMember({ ...newMember, firstName: e.target.value })
                }
                disabled={isDemoPitch}
              />
              <Input
                placeholder="Last Name"
                value={newMember.lastName}
                onChange={(e) =>
                  !isDemoPitch && setNewMember({ ...newMember, lastName: e.target.value })
                }
                disabled={isDemoPitch}
              />
              <Input
                placeholder="Designation"
                value={newMember.designation}
                onChange={(e) =>
                  !isDemoPitch && setNewMember({ ...newMember, designation: e.target.value })
                }
                disabled={isDemoPitch}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newMember.email}
                onChange={(e) =>
                  !isDemoPitch && setNewMember({ ...newMember, email: e.target.value })
                }
                disabled={isDemoPitch}
              />
              <Button
                onClick={handleInvite}
                className="w-[25%] bg-muted hover:bg-muted/50"
                disabled={
                  isLoading ||
                  !newMember.firstName ||
                  !newMember.lastName ||
                  !newMember.email ||
                  !newMember.designation ||
                  isDemoPitch
                }
              >
                {isLoading ? "Inviting..." : "Invite"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="Team" className="space-y-4">
            <TabsList>
              <TabsTrigger value="Team" className="flex items-center gap-2">
                Team
                <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                  {activeMembers.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="Pending" className="flex items-center gap-2">
                Pending
                <span className="bg-muted px-2 py-0.5 rounded-[0.35rem] text-xs">
                  {pendingMembers.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Team">
              <div className="space-y-4">
                {isFetching ? (
                  Array(3).fill(0).map((_, i) => <LoadingMemberCard key={i} />)
                ) : (
                  activeMembers.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="Pending">
              <div className="space-y-4">
                {isFetching ? (
                  Array(2).fill(0).map((_, i) => <LoadingMemberCard key={i} />)
                ) : (
                  pendingMembers.map((member) => (
                    <PendingCard key={member.id} member={member} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
