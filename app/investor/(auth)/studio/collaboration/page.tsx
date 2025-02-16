"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import formatDate from "@/lib/formatDate";
import { DaftarProfile } from "@/components/DaftarProfile";
import { X, Plus, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

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

  const handleInvite = () => {
    if (daftarId.length !== 6) {
      toast({
        title: "Invalid Daftar ID",
        description: "Please enter a valid 6-character Daftar ID",
        variant: "destructive"
      });
      return;
    }

    // Add new collaborator
    const newCollaborator: Collaborator = {
      id: Math.random().toString(),
      daftarId: daftarId,
      daftarName: "tech innovators",
      status: "Pending",
      addedAt: new Date().toISOString(),
      daftarDetails: {
        structure: "Government Incubator",
        website: "www.example.com",
        location: "Mumbai, India",
        bigPicture: "Building the next generation of financial infrastructure"
      }
    };

    setCollaborators([...collaborators, newCollaborator]);
    setDaftarId("");
    toast({
      title: "Invitation sent",
      description: `Invitation sent to Daftar ${daftarId}`
    });
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
    toast({
      title: "Collaborator removed"
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
                <div className="flex gap-2">
                  <Button onClick={handleInvite} variant="outline">
                    Invite
                  </Button>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold">About Collaboration</h4>
                        <p className="text-sm text-muted-foreground">
                          A collaborator helps your Scout connect with the right partners in a specific location and reach a larger audience.
                          <br /><br />
                          Since they've been working in the area for a long time, they understand the local ecosystem and speak the language founders speak.
                          <br /><br />
                          They're typically incubators, accelerators, angels, founder's offices, or VCs with strong local networks.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>

              {/* Collaborators List */}
              <div className="space-y-4">
                {collaborators.map((collaborator) => (
                  <div 
                    key={collaborator.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-background"
                  >
                    <div>
                      <DaftarProfile
                        collaborator={{
                          daftarName: collaborator.daftarName,
                          daftarDetails: collaborator.daftarDetails,
                          addedAt: collaborator.addedAt
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Info (1/3 width) */}
        <div>
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="space-y-6">
            <h3 className="text-lg font-semibold">Support</h3>
              <p className="text-sm text-muted-foreground">
                Looking for the right collaborator? Whether you have someone in mind or need help finding the perfect match, Daftar's got you covered.
                <br /><br />
                Schedule a quick call with us, and we'll help you figure it out.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Textarea 
                    placeholder="How can we help you?"
                    className="h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Input 
                    placeholder="When should we call you? e.g. 2:00 PM IST"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      className="w-20"
                      placeholder="+91"
                    />
                    <Input
                      className="flex-1"
                      placeholder="Enter phone number"
                    />
                  </div>
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
