"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import formatDate from "@/lib/formatDate";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { InvestorProfile } from "@/components/InvestorProfile";

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

  const scoutId = "scout_123"; // Replace with dynamic value if needed

  useEffect(() => {
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
          daftarName: item.daftar?.name || "Unknown Daftar",
          status: item.isPending ? "Pending" : "Accepted",
          addedAt: item.createdAt || new Date().toISOString(),
          daftarDetails: {
            structure: item.daftar?.structure || "Unknown",
            website: item.daftar?.website || "N/A",
            location: item.daftar?.location || "N/A",
            bigPicture: item.daftar?.bigPicture || "No description",
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
    }
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter((c) => c.id !== id));
    toast({
      title: "Collaborator removed",
    });
  };

  return (
    <div className="container px-4 mt-4 mx-auto py-6">
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
                />
                <Button onClick={handleInvite} variant="outline">
                  Invite
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
                            // imageUrl: "https://github.com/shadcn.png",
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Status: {collaborator.status}
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {formatDate(collaborator.addedAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCollaborator(collaborator.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                <video
                  src="example.mp4"
                  className="w-full h-auto object-cover rounded-lg"
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
                <Textarea placeholder="How can we help you?" className="h-24" />
                <Input placeholder="When should we call you? e.g. 2:00 PM IST" />
                <div className="flex gap-2">
                  <Input className="w-20" placeholder="+91" />
                  <Input className="flex-1" placeholder="Enter phone number" />
                </div>
                <Button variant="outline" className="w-full">
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
