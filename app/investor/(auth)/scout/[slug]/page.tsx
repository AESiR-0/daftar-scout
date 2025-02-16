"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Share2 } from "lucide-react"
import { EndScoutingDialog } from "@/components/dialogs/end-scouting-dialog"
import { useState } from "react"
import { UpdatesDialog } from "@/components/dialogs/updates-dialog"
import { LaunchProgramDialog } from "@/components/dialogs/launch-program-dialog"
import Link from "next/link"
import { InsightsDialog } from "@/components/dialogs/insights-dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/format-date"

interface ColumnPitch {
  id: string;
  pitchName: string;
  daftarName: string;
  Believer: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

const columns: Record<string, { title: string; pitches: ColumnPitch[] }> = {
  inbox: {
    title: "Inbox",
    pitches: [
      {
        id: "1",
        pitchName: "AI Chatbot",
        daftarName: "Tech Startup",
        Believer: "3"
      },
      // Add more pitches
    ]
  }, inDiscussion: {
    title: "In Discussion",
    pitches: [
      {
        id: "3",
        pitchName: "Stock Market",
        daftarName: "FinTech Pro",
        Believer: "3"
      }
    ]
  }, accepted: {
    title: "Deal Accepted",
    pitches: [
      {
        id: "4",
        pitchName: "Learning Platform",
        daftarName: "EduTech",
        Believer: "5"
      }
    ]
  },
  dealCancelled: {
    title: "Deal Cancelled",
    pitches: [
      {
        id: "2",
        pitchName: "Green Energy",
        daftarName: "HealthTech",
        Believer: "3"
      }
    ]
  },


  deleted: {
    title: "Pitch Deleted",
    pitches: [
      {
        id: "5",
        pitchName: "AI Chatbot",
        daftarName: "Tech Startup",
        Believer: "3",
        deletedAt: "2024-03-20"
      }
    ]
  }
}

const programDetails = {
  updates: [
    { id: "1", content: "Update 1", date: "2024-03-15" },
    { id: "2", content: "Update 2", date: "2024-03-14" },
    // Add more updates
  ]
}

// Add this type for scout status
type ScoutStatus = 'planning' | 'scheduled' | 'active' | 'completed'

interface Scout {
  id: string;
  name: string;
  status: ScoutStatus;
  scheduledDate?: string;
  // ... other scout properties
}

// This should be replaced with actual API call or data fetching
const scouttatus = {
  planning: [
    {
      title: "Green Energy Initiative",
      postedby: "John Doe",
      status: "Planning",
      scheduledDate: "2024-04-15 10:00 AM"
    },
    {
      title: "Healthcare Tech Fund",
      postedby: "Sarah Johnson",
      status: "Planning",
    },
  ],
  scheduled: [
    {
      title: "AI Ventures",
      postedby: "John Doe",
      status: "Scheduled",
      scheduledDate: "2024-04-20 10:00 AM"
    },
  ],
  open: [
    {
      title: "Tech Startup Fund",
      postedby: "John Doe",
      status: "Open",
    },
    {
      title: "Real Estate Growth",
      postedby: "John Doe",
      status: "Open",
    },
  ],
  closed: [
    {
      title: "Fintech Innovation",
      postedby: "John Doe",
      status: "Closed",
    },
  ],
}

const getScoutStatus = (scoutName: string): { status: string; scheduledDate?: string } => {
  const planningScout = scouttatus.planning.find(scout =>
    scout.title.toLowerCase().split(' ').join('-') === scoutName.toLowerCase()
  )

  const scheduledScout = scouttatus.scheduled.find(scout =>
    scout.title.toLowerCase().split(' ').join('-') === scoutName.toLowerCase()
  )

  if (planningScout) {
    return { status: planningScout.status, scheduledDate: planningScout.scheduledDate }
  }
  if (scheduledScout) {
    return { status: scheduledScout.status, scheduledDate: scheduledScout.scheduledDate }
  }

  return { status: 'active' }
}

export default function ProgramDetailsPage() {
  const pathname = usePathname()
  const scout = pathname.split('/').pop()
  const params = useParams()

  if (!scout) {
    return <div>Scout not found</div>
  }
  else {
    const { status: scoutStatus, scheduledDate } = getScoutStatus(scout)

    if (scoutStatus === 'Planning' || scoutStatus === 'Scheduled') {
      return (
        <div className="space-y-6 max-w-6xl mt-4 container mx-auto">
          {/* Header Section */}
          <div className="flex items-end justify-between w-full gap-2">
            <div className="flex items-center justify-end w-full gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLaunchProgramOpen(true)}
              >
                <span className="text-xs">Launch Program</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEndScoutingOpen(true)}
              >
                End Scouting
              </Button>
              <Link href={`/investor/studio/details?mode=edit&programId=${params.slug}`}>
                <Button variant="outline" size="sm">
                  <span className="text-xs">Studio</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpdatesOpen(true)}
              >
                Updates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInsightsOpen(true)}
              >
                Insights
              </Button>
              <Button
                variant={"outline"}
                className="text-white"
                size="sm"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url).then(() => {
                    // You may want to add a toast notification here
                    alert("Link copied to clipboard!");
                  });
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>

            </div>
          </div>

          {/* Updated message section */}
          {scoutStatus === 'Planning' ? (
            <div className="text-center flex-col text-xl text-muted-foreground flex items-start justify-start h-96">
              <div className="text-lg font-bold">Click on the Studio to continue building your Scout.</div>
            </div>
          ) : scoutStatus === 'Scheduled' ? (
            <div className="text-center flex-col text-xl text-muted-foreground flex items-start justify-start h-96">
              <div className="text-lg font-bold">The Scout is not live</div>
              <div className="text-xs text-muted-foreground">
                <p>Scheduled Date: {scheduledDate ? new Date(scheduledDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                }) : 'N/A'}</p>
              </div>
            </div>
          ) : null}
        </div>
      )
    }
  }
  const [endScoutingOpen, setEndScoutingOpen] = useState(false)
  const [updatesOpen, setUpdatesOpen] = useState(false)
  const [launchProgramOpen, setLaunchProgramOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)

  const handleEndScouting = () => {
    // Add your end scouting logic here
    console.log("Ending scouting process...")
  }

  const handleAddUpdate = (content: string) => {
    // Add your update logic here
    console.log("Adding update:", content)
  }

  const handleDeleteUpdate = (id: string) => {
    // Add your delete logic here
    console.log("Deleting update:", id)
  }

  const handleSubmitFeedback = (feedback: string) => {
    // Add your feedback submission logic here
    console.log("Submitting feedback:", feedback)
  }

  return (
    <div className="space-y-6 max-w-[80rem] mt-4 container mx-auto">
      {/* Header Section */}
      <div className="flex items-end justify-end w-full gap-2">
        <div className="flex items-center justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLaunchProgramOpen(true)}
          >
            <span className="text-xs">Launch Program</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEndScoutingOpen(true)}
          >
            End Scouting
          </Button>
          <Link href={`/investor/studio/details?mode=edit&programId=${params.slug}`}>
            <Button variant="outline" size="sm">
              <span className="text-xs">Studio</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUpdatesOpen(true)}
          >
            Updates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInsightsOpen(true)}
          >
            Insights
          </Button>
          <Button
            variant={"outline"}
            className="text-white"
            size="sm"
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url).then(() => {
                // You may want to add a toast notification here
                alert("Link copied to clipboard!");
              });
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>

        </div>
      </div>

      {/* Updated Columns Section with ScrollArea */}
      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex gap-4 p-1">
          {Object.entries(columns).map(([key, column]) => (
            <div
              key={key}
              className="w-[300px] shrink-0 bg-muted/30 rounded-[0.35rem] p-4 min-h-[calc(100vh-12rem)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {column.pitches.length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {column.pitches.map((pitch) => (
                  <Link
                    key={pitch.id}
                    href={`/investor/scout/${params.slug}/details/${pitch.id}`}
                  >
                    <div className="p-4 rounded-[0.35rem] mb-2 bg-background border shadow-sm hover:border-blue-600 transition-colors">
                      <div>
                        <h4 className="font-medium text-sm">{pitch.pitchName}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{pitch.daftarName}</p>

                      </div>
                      <p className="text-xs mt-4 text-blue-500 font-semibold">
                        Believer {pitch.Believer} out of 5
                      </p>
                    </div>
                  </Link>
                ))}

                {column.pitches.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No pitches in {column.title}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <EndScoutingDialog
        open={endScoutingOpen}
        onOpenChange={setEndScoutingOpen}
        onConfirm={handleEndScouting}
      />

      <UpdatesDialog
        open={updatesOpen}
        onOpenChange={setUpdatesOpen}
        updates={programDetails.updates}
        onAddUpdate={handleAddUpdate}
        onDeleteUpdate={handleDeleteUpdate}
      />

      <LaunchProgramDialog
        open={launchProgramOpen}
        onOpenChange={setLaunchProgramOpen}
        onSubmitFeedback={handleSubmitFeedback}
      />

      <InsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
      />
    </div>
  )
} 