"use client"
import { useSearch } from "@/lib/context/search-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState } from "react"
import { InsightsDialog } from "@/components/dialogs/insights-dialog"
import MeetingsPage from "@/app/founder/(auth)/meetings/page"
import { CreateScoutDialog } from "@/components/dialogs/create-scout-dialog"
import { useToast } from "@/hooks/use-toast"

interface Scout {
  id: string
  title: string
  postedby: string
  status: 'Planning' | 'Scheduled' | 'Active' | 'Closed'
  scheduledDate?: string
}

interface ScoutStatus {
  planning: Scout[]
  scheduled: Scout[]
  active: Scout[]
  closed: Scout[]
}

const initialScoutStatus: ScoutStatus = {
  planning: [
    {
      id: 'green-energy',
      title: "Green Energy Initiative",
      postedby: "Nithin Kamath",
      status: "Planning",
    },
  ],
  scheduled: [
    {
      id: 'ai-ventures',
      title: "AI Ventures",
      postedby: "Aman Gupta",
      status: "Scheduled",
      scheduledDate: "Feb 20th, 2025, 10:00 AM"
    },
  ],
  active: [
    {
      id: 'tech-startup',
      title: "Tech Startup Fund",
      postedby: "GUSEC",
      status: "Active",
    },
  ],
  closed: [
    {
      id: 'fintech',
      title: "Fintech Innovation",
      postedby: "Narayan Murthy",
      status: "Closed",
    },
  ],
}

export default function ScoutPage() {
  const { searchQuery, filterValue } = useSearch()
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [showMeetings, setShowMeetings] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [createScoutOpen, setCreateScoutOpen] = useState(false)
  const [scoutStatus, setScoutStatus] = useState<ScoutStatus>(initialScoutStatus)
  const { toast } = useToast()

  const filteredScouts = Object.entries(scoutStatus).reduce((acc, [key, scouts]) => {
    const filtered = scouts.filter((scout: any) => {
      const matchesSearch = scout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scout.postedby.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterValue === 'all' || scout.status.toLowerCase() === filterValue.toLowerCase()
      return matchesSearch && matchesFilter
    })
    return { ...acc, [key]: filtered }
  }, {} as ScoutStatus)

  const handleScoutCreate = (scoutName: string) => {
    setScoutStatus(prev => ({
      ...prev,
      planning: [
        {
          id: 'new-scout',
          title: scoutName,
          postedby: "NA",
          status: "Planning",
        },
        ...prev.planning,
      ]
    }))

    toast({
      title: "Scout Created",
      description: "New scout has been added to planning",
    })
  }


  if (!showContent) {
    return (
      <div className="min-h-screen flex flex-col items-center  justify-center p-4">
        <div className="max-w-3xl w-full space-y-8 text-center">
          {/* Video Container */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <video
              className="w-full h-full object-cover"
              src="/videos/intro.mp4"
              controls
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Button */}
          <Button
            variant="secondary"
            size="lg"
            className="px-8 py-6 text-md"
            onClick={() => setShowContent(true)}
          >
            Create Scout
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-20 mt-4 container mx-auto">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setShowMeetings(!showMeetings)}
          className={showMeetings ? "bg-muted" : ""}
        >
          Meetings
        </Button>

        <Button
          variant="outline"
          className="h-9"
          onClick={() => setCreateScoutOpen(true)}
        >
          New Scout
        </Button>
      </div>

      {showMeetings ? (
        <MeetingsPage />
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {Object.entries(filteredScouts).map(([status, scouts]) => (
            <div
              key={status}
              className="bg-muted/30 rounded-lg p-4 min-h-[calc(100vh-12rem)] border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold capitalize text-foreground">{status}</h2>
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    {scouts.length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-5">
                {scouts.map((scout: any) => (
                  <Link
                    key={program.title}
                    href={`/investor/scout/${program.title.toLowerCase().replace(/ /g, '-')}${program.status === "Planning"
                        ? "/planning"
                        : program.status === "Scheduled"
                          ? "/scheduled"
                          : ""
                      }`}
                  >
                    <div className="p-4 m-2 rounded-[0.35rem] hover:border-muted-foreground hover:border bg-background transition-colors">
                      <h3 className="font-medium text-sm text-foreground">{scout.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Collaboration : <span className="font-medium">{scout.postedby}</span>
                      </p>
                    </div>
                  </Link>
                ))}

                {scouts.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground bg-background/5 rounded-[0.35rem] border border-border">
                    No scout in {status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <InsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
      />

      <CreateScoutDialog
        open={createScoutOpen}
        onOpenChange={setCreateScoutOpen}
        onScoutCreate={handleScoutCreate}
      />
    </div>
  )
} 
