"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, Building2, X } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type CollaborationStatus = "Pending" | "Accepted" | "Declined" | "Withdrawn" | "Removed"

interface Collaborator {
  id: string
  daftarId: string
  daftarName: string
  type: string
  status: CollaborationStatus
  addedAt: string
  daftarDetails: {
    owner: string
    ownerAvatar: string
    industry: string
    stage: string
    teamSize: string
    location: string
    founded: string
    vision: string
    website: string
  }
}

const initialCollaborators: Collaborator[] = [
  {
    id: "1",
    daftarId: "DAF001",
    daftarName: "Tech Innovation Fund",
    type: "Program Manager",
    status: "Accepted",
    addedAt: "2024-03-20T14:30:00",
    daftarDetails: {
      owner: "John Doe",
      ownerAvatar: "https://github.com/shadcn.png",
      industry: "Technology",
      stage: "Seed",
      teamSize: "10-50",
      location: "Dubai, UAE",
      founded: "2023",
      vision: "To revolutionize investment landscape",
      website: "https://example.com"
    }
  }
]

const statusColors: Record<CollaborationStatus, { bg: string, text: string }> = {
  "Pending": { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  "Accepted": { bg: "bg-green-500/10", text: "text-green-500" },
  "Declined": { bg: "bg-red-500/10", text: "text-red-500" },
  "Withdrawn": { bg: "bg-gray-500/10", text: "text-gray-500" },
  "Removed": { bg: "bg-red-900/10", text: "text-red-900" }
}

// Add priority levels for status sorting
const statusPriority: Record<CollaborationStatus, number> = {
  "Pending": 1,
  "Accepted": 2,
  "Declined": 3,
  "Withdrawn": 4,
  "Removed": 5
}

export default function CollaborationPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [daftarId, setDaftarId] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | CollaborationStatus>("all")
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators)

  const handleDaftarIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    if (value.length <= 6 && /^[A-Z0-9]*$/.test(value)) {
      setDaftarId(value)
    }
  }

  const addCollaborator = () => {
    if (daftarId.length !== 6) {
      toast({
        title: "Invalid Daftar ID",
        description: "Please enter a 6-character alphanumeric ID",
        variant: "destructive"
      })
      return
    }

    if (collaborators.some(c => c.daftarId === daftarId)) {
      toast({
        title: "Already exists",
        description: "This Daftar is already in your collaborations",
        variant: "destructive"
      })
      return
    }

    const newCollaborator: Collaborator = {
      id: Math.random().toString(36).substr(2, 9),
      daftarId: daftarId,
      daftarName: `Daftar ${daftarId}`,
      type: "Collaborator",
      status: "Pending",
      addedAt: new Date().toISOString(),
      daftarDetails: {
        owner: "Pending...",
        ownerAvatar: "",
        industry: "Pending...",
        stage: "Pending...",
        teamSize: "Pending...",
        location: "Pending...",
        founded: "Pending...",
        vision: "Pending...",
        website: "Pending..."
      }
    }

    setCollaborators([newCollaborator, ...collaborators])
    setDaftarId("")
    toast({
      title: "Invitation sent",
      description: `Collaboration request sent to ${daftarId}`
    })
  }

  const updateStatus = (id: string, newStatus: CollaborationStatus) => {
    setCollaborators(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ))
    toast({
      title: "Status updated",
      description: `Collaboration ${newStatus.toLowerCase()}`
    })
  }

  const filteredCollaborators = collaborators
    .filter(collaborator => 
      (activeFilter === "all" || collaborator.status === activeFilter) &&
      (collaborator.daftarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       collaborator.daftarId.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      // First sort by status priority
      const priorityDiff = statusPriority[a.status] - statusPriority[b.status]
      if (priorityDiff !== 0) return priorityDiff
      
      // Then sort by date within same status
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    })

  const groupedCollaborators = filteredCollaborators
    .reduce((groups, collaborator) => {
      const status = collaborator.status
      if (!groups[status]) {
        groups[status] = []
      }
      groups[status].push(collaborator)
      return groups
    }, {} as Record<CollaborationStatus, Collaborator[]>)

  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader>
        <CardTitle>Collaborations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Add */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collaborators..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Input 
            placeholder="Enter Daftar ID" 
            className="w-[200px] uppercase"
            value={daftarId}
            onChange={handleDaftarIdChange}
            maxLength={6}
          />
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={addCollaborator}
            disabled={daftarId.length !== 6}
          >
            Add Collaborator
          </Button>
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
          {/* Active Collaborations */}
          {(groupedCollaborators["Pending"] || []).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-yellow-500">Pending</h3>
              {groupedCollaborators["Pending"]?.map(collaborator => (
                <CollaboratorItem 
                  key={collaborator.id} 
                  collaborator={collaborator}
                  updateStatus={updateStatus}
                />
              ))}
            </div>
          )}

          {(groupedCollaborators["Accepted"] || []).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-green-500">Active</h3>
              {groupedCollaborators["Accepted"]?.map(collaborator => (
                <CollaboratorItem 
                  key={collaborator.id} 
                  collaborator={collaborator}
                  updateStatus={updateStatus}
                />
              ))}
            </div>
          )}

          {(groupedCollaborators["Declined"] || []).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-red-500">Declined</h3>
              {groupedCollaborators["Declined"]?.map(collaborator => (
                <CollaboratorItem 
                  key={collaborator.id} 
                  collaborator={collaborator}
                  updateStatus={updateStatus}
                />
              ))}
            </div>
          )}

          {/* Inactive Collaborations */}
          {((groupedCollaborators["Withdrawn"]?.length || 0) + 
            (groupedCollaborators["Removed"]?.length || 0)) > 0 && (
            <div className="space-y-3 opacity-75">
              <h3 className="text-sm font-medium text-muted-foreground">Inactive</h3>
              {groupedCollaborators["Withdrawn"]?.map(collaborator => (
                <CollaboratorItem 
                  key={collaborator.id} 
                  collaborator={collaborator}
                  updateStatus={updateStatus}
                />
              ))}
              {groupedCollaborators["Removed"]?.map(collaborator => (
                <CollaboratorItem 
                  key={collaborator.id} 
                  collaborator={collaborator}
                  updateStatus={updateStatus}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Extract collaborator item to a separate component for cleaner code
function CollaboratorItem({ 
  collaborator, 
  updateStatus 
}: { 
  collaborator: Collaborator
  updateStatus: (id: string, status: CollaborationStatus) => void 
}) {
  return (
    <div 
      className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-600 transition-colors"
    >
      <div className="space-y-1">
        <HoverCard>
          <HoverCardTrigger className="flex items-center gap-2 cursor-pointer">
            <span className="text-blue-600 hover:underline">
              {collaborator.daftarName}
            </span>
            <Badge variant="secondary">
              {collaborator.type}
            </Badge>
            <Badge 
              className={`${statusColors[collaborator.status].bg} ${statusColors[collaborator.status].text}`}
            >
              {collaborator.status}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={collaborator.daftarDetails.ownerAvatar} />
                <AvatarFallback>DO</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-medium">{collaborator.daftarName}</h4>
                <p className="text-xs text-muted-foreground">
                  {collaborator.daftarDetails.industry}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Team Size:</span>
                <span>{collaborator.daftarDetails.teamSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span>{collaborator.daftarDetails.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Website:</span>
                <Link 
                  href={collaborator.daftarDetails.website} 
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  {collaborator.daftarDetails.website}
                </Link>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        <p className="text-sm text-muted-foreground">
          Added {new Date(collaborator.addedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {collaborator.status === "Pending" && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => updateStatus(collaborator.id, "Withdrawn")}
            className="text-yellow-500 hover:text-yellow-600"
          >
            Withdraw
          </Button>
        )}
        {collaborator.status !== "Removed" && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => updateStatus(collaborator.id, "Removed")}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
} 