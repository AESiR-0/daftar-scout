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

interface TeamMember {
  id: string;
  userId: string;
  pitchId: string;
  designation: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: string;
  gender?: string;
  location?: string;
  language?: string[];
  imageUrl?: string;
  status: "active" | "pending";
  isCurrentUser?: boolean;
  joinDate?: string;
  phone?: string;
}

export default function TeamPage() {
  const { toast } = useToast();
  const { pitchId } = usePitch(); // Get pitchId from context

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
    const match = phone.match(/^(.+?)(\d{10})$/);
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

  useEffect(() => {
    if (pitchId) {
      fetchTeamMembers();
    }
  }, [pitchId]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/endpoints/pitch/founder/team", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(pitchId && { pitch_id: pitchId }),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch team members");
      const { data } = await response.json();

      const enrichedMembers = data.map((member: any, index: number) => ({
        ...member,
        firstName: member.userId === "user_1" ? "Current" : `Team${index + 1}`,
        lastName: member.userId === "user_1" ? "User" : "Member",
        email: `${member.userId}@example.com`,
        age: "28",
        gender: "Not Specified",
        location: "Dubai, UAE",
        language: ["English"],
        status: index % 2 === 0 ? "active" : "pending",
        isCurrentUser: member.userId === "user_1",
        joinDate: new Date().toISOString().split("T")[0],
        phone: "+971526374859",
      }));

      setMembers(enrichedMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    }
  };

  const handleInvite = async () => {
    if (!pitchId) {
      toast({
        title: "Error",
        description: "No pitch selected",
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
          userId: newMember.email, // Placeholder
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
    setMembers(members.filter((member) => member.id !== id));
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((member) => member.id !== id));
  };

  const handleWithdraw = () => {
    console.log("Withdrawing from team");
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editDesignation, setEditDesignation] = useState("");

  const handleSaveDesignation = () => {
    setIsEditing(false);
  };

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-[0.35rem]">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Avatar className="h-48 w-48 rounded-[0.35rem]">
            {member.imageUrl ? (
              <AvatarImage
                src={member.imageUrl}
                alt={member.firstName}
                className="rounded-[0.35rem]"
              />
            ) : (
              <AvatarFallback className="rounded-[0.35rem] text-xl">
                {getInitials(`${member.firstName} ${member.lastName}`)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-medium">
                {member.firstName} {member.lastName}
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
                {member.age && (
                  <div className="flex items-center gap-2">
                    <span>{member.age}</span>
                    <span>{member.gender}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2">
                    <p>{member.email}</p>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <p>{formatPhoneNumber(member.phone)}</p>
                  </div>
                )}
                {member.location && (
                  <div className="flex items-center gap-2">
                    <p>{member.location}</p>
                  </div>
                )}
                {member.language && (
                  <p className="text-sm text-muted-foreground">
                    Preferred languages: {member.language.join(", ")}
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
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 w-8"
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
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMember(member.id)}
              className="h-8 w-8"
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
                {member.firstName} {member.lastName}
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
                  setNewMember({ ...newMember, firstName: e.target.value })
                }
              />
              <Input
                placeholder="Last Name"
                value={newMember.lastName}
                onChange={(e) =>
                  setNewMember({ ...newMember, lastName: e.target.value })
                }
              />
              <Input
                placeholder="Designation"
                value={newMember.designation}
                onChange={(e) =>
                  setNewMember({ ...newMember, designation: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
              />
              <Button
                onClick={handleInvite}
                className="w-[25%] bg-muted hover:bg-muted/50"
                disabled={
                  isLoading ||
                  !newMember.firstName ||
                  !newMember.lastName ||
                  !newMember.email ||
                  !newMember.designation
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
                {activeMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="Pending">
              <div className="space-y-4">
                {pendingMembers.map((member) => (
                  <PendingCard key={member.id} member={member} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
