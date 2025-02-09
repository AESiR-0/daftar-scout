"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import formatDate from "@/lib/formatDate";
import { DaftarProfile } from "@/components/DaftarProfile";

type CollaborationStatus = "Pending" | "Accepted" | "Declined" | "Withdrawn" | "Removed";

interface Collaborator {
  id: string;
  daftarId: string;
  daftarName: string;
  type: string;
  status: CollaborationStatus;
  addedAt: string;
  daftarDetails: {
    owner: string;
    industry: string;
    structure: string;
    teamSize: string;
    location: string;
    founded: string;
    biggerPicture: string;
    website: string;
  };
}

const statusPriority: Record<CollaborationStatus, number> = {
  "Pending": 1,
  "Accepted": 2,
  "Declined": 3,
  "Withdrawn": 4,
  "Removed": 5,
};

export default function CollaborationPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [daftarId, setDaftarId] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | CollaborationStatus>("all");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchLocations();
    fetchIndustries();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }
      const data = await response.json();
      const formattedLocations = data
        .map((country: any) => country.name.common)
        .sort();
      setLocationOptions(formattedLocations);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchIndustries = async () => {
    try {
      const response = await fetch("https://api.mocki.io/v1/ce5f60e2"); // Replace with actual industry API
      if (!response.ok) {
        throw new Error("Failed to fetch industries");
      }
      const data = await response.json();
      setIndustryOptions(data.industries || []);
    } catch (error) {
      console.error("Error fetching industries:", error);
    }
  };


  const updateStatus = (id: string, newStatus: CollaborationStatus) => {
    setCollaborators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    toast({ title: "Status updated", description: `Collaboration ${newStatus.toLowerCase()}` });
  };

  const filteredCollaborators = collaborators
    .filter(
      (collaborator) =>
        (activeFilter === "all" || collaborator.status === activeFilter) &&
        (collaborator.daftarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collaborator.daftarId.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
      return priorityDiff !== 0 ? priorityDiff : new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

  const groupedCollaborators = filteredCollaborators.reduce((groups, collaborator) => {
    const status = collaborator.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(collaborator);
    return groups;
  }, {} as Record<CollaborationStatus, Collaborator[]>);

  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle>Collaborations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Add */}
        <div className="flex items-center gap-4">
          <Input placeholder="Search collaborators..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Input placeholder="Enter Daftar ID" value={daftarId} onChange={(e) => setDaftarId(e.target.value.toUpperCase())} maxLength={6} />
        </div>

        {/* Status Filters */}
        <Tabs defaultValue="all" onValueChange={(value) => setActiveFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Accepted">Accepted</TabsTrigger>
            <TabsTrigger value="Declined">Declined</TabsTrigger>
            <TabsTrigger value="Withdrawn">Withdrawn</TabsTrigger>
            <TabsTrigger value="Removed">Removed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Collaborators List */}
        <div className="space-y-6">
          {Object.keys(groupedCollaborators).map((status) => (
            <div key={status} className="space-y-3">
              <h3 className="text-sm font-medium">{status}</h3>
              {groupedCollaborators[status as CollaborationStatus]?.map((collaborator) => (
                <CollaboratorItem key={collaborator.id} collaborator={collaborator} updateStatus={updateStatus} />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Extracted Collaborator Item Component
function CollaboratorItem({ collaborator, updateStatus }: { collaborator: Collaborator; updateStatus: (id: string, status: CollaborationStatus) => void }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg transition-colors">
      <div className="space-y-1">
        <DaftarProfile collaborator={collaborator} />
        <p className="text-sm text-muted-foreground">Added {formatDate(new Date(collaborator.addedAt).toISOString())}</p>
      </div>
    </div>
  );
}
