"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, Building2 } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Sample data
const collaborators = [
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function CollaborationPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCollaborators = collaborators.filter(collaborator => 
    collaborator.daftarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collaborator.daftarId.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            className="w-[200px]" 
          />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Add Collaborator
          </Button>
        </div>

        {/* Collaborators List */}
        <div className="space-y-3">
          {filteredCollaborators.map((collaborator) => (
            <div 
              key={collaborator.id}
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
                  Added {formatDate(collaborator.addedAt)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant={collaborator.status === "Accepted" ? "default" : "secondary"}>
                  {collaborator.status}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 