"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Share2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { Badge } from "../ui/badge"
import { EndScoutingDialog } from "../dialogs/end-scouting-dialog"
import { UpdatesDialog } from "../dialogs/updates-dialog"
import { LaunchProgramDialog } from "../dialogs/launch-program-dialog"
import { InsightsDialog } from "../dialogs/insights-dialog"

interface Pitch {
  id: string
  pitchName: string
  daftarName: string
  Believer: string
  averageNPS: string
  interestedCount: number
}

interface Section {
  id: string
  title: string
  pitches: Pitch[]
}

const sections: Section[] = [
  {
    id: "inbox",
    title: "Inbox",
    pitches: [
      { id: "1", pitchName: "AI Chatbot", daftarName: "Tech Startup", Believer: "3", averageNPS: "8.5/10", interestedCount: 5 },
      { id: "2", pitchName: "Blockchain Solution", daftarName: "Tech Startup", Believer: "3", averageNPS: "9/10", interestedCount: 3 },
      { id: "7", pitchName: "IoT Platform", daftarName: "Tech Startup", Believer: "4", averageNPS: "8.8/10", interestedCount: 6 },
      { id: "8", pitchName: "Cloud Service", daftarName: "Tech Startup", Believer: "5", averageNPS: "9.5/10", interestedCount: 8 },
      { id: "9", pitchName: "ML Solution", daftarName: "Tech Startup", Believer: "4", averageNPS: "8.7/10", interestedCount: 4 },
    ]
  },
  {
    id: "inDiscussion",
    title: "In Discussion",
    pitches: [
      { id: "3", pitchName: "E-commerce Platform", daftarName: "FinTech Pro", Believer: "3", averageNPS: "7.8/10", interestedCount: 2 },
    ]
  },
  {
    id: "dealAccepted",
    title: "Deal Accepted",
    pitches: [
      { id: "4", pitchName: "HealthTech App", daftarName: "EduTech", Believer: "5", averageNPS: "9.2/10", interestedCount: 4 },
    ]
  },
  {
    id: "dealCancelled",
    title: "Deal Cancelled",
    pitches: [
      { id: "5", pitchName: "Green Energy", daftarName: "HealthTech", Believer: "3", averageNPS: "7/10", interestedCount: 1 },
    ]
  },
  {
    id: "deleted",
    title: "Pitch Deleted",
    pitches: [
      { id: "6", pitchName: "Old Startup Idea", daftarName: "Tech Startup", Believer: "3", averageNPS: "5/10" , interestedCount: 0 },
    ]
  }
]

export function ScoutSidebar({ scoutSlug }: { scoutSlug: string }) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["inbox"])
  const [endScoutingOpen, setEndScoutingOpen] = useState(false)
  const [updatesOpen, setUpdatesOpen] = useState(false)
  const [launchProgramOpen, setLaunchProgramOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  // Format scout name for display
  const scoutName = scoutSlug.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  return (
    <div className="w-[16rem]  p-4  h-full">
      <div className="bg-[#1a1a1a] flex h-full rounded-[0.35rem] flex-col">
        {/* Scout Name Header */}
        <div className="border-b shrink-0">
          <div className="border-b px-4 py-4">
            <h2 className="text-[14px] font-semibold">{scoutName}</h2>
          </div>
          <div className="px-4 py-2">
            <Link href={`/investor/studio/details?mode=edit&programId=${scoutSlug}`}>
              <Button
                variant="link"
                size="sm"
                className="w-full text-white px-0 justify-start" >
                Studio
              </Button>
            </Link>

            <Button
              variant="link"
              size="sm"
              className="w-full px-0 py-0  text-white justify-start"
              onClick={() => setUpdatesOpen(true)}
            >
              Updates
            </Button>
          </div>
        </div>

        {/* Scrollable Sections */}
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id}>
                <Button
                  variant="ghost"
                  className="w-full px-2 justify-between font-normal "
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    {section.title} <Badge variant="secondary">{section.pitches.length}</Badge>
                  </div>
                </Button>

                {expandedSections.includes(section.id) && (
                  <div className="mx-4 space-y-2 mt-2">
                    {section.pitches.map((pitch) => (
                      <Link
                        key={pitch.id}
                        href={`/investor/scout/${scoutSlug}/details/${pitch.id}`}
                      >
                        <Card className="hover:bg-muted/50 mt-1 transition-colors">
                          <CardContent className="p-4 space-y-2">
                            <h3 className="font-medium text-sm">{pitch.pitchName}</h3>
                            <div className="text-xs text-muted-foreground">
                              <p>NPS Score: {pitch.averageNPS}</p>
                              <p>Interested Team Members: {pitch.interestedCount}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="px-4 py-2 border-t">
          <Button
            size="sm"
            variant="link"
            className="px-0 py-0 text-white"
            onClick={() => setLaunchProgramOpen(true)}
          >
            Launch Program
          </Button>
          <br />
          <Button
            size="sm"
            variant="link"
            className="px-0 py-0 text-white"
            onClick={() => setEndScoutingOpen(true)}
          >
            End Scouting
          </Button>

          {/* <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => setInsightsOpen(true)}
        >
          Insights
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
              alert("Link copied to clipboard!");
            });
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button> */}
        </div>

        {/* Dialogs */}
        <EndScoutingDialog
          open={endScoutingOpen}
          onOpenChange={setEndScoutingOpen}
          onConfirm={() => {
            console.log("Ending scouting process...")
          }}
        />

        <UpdatesDialog
          open={updatesOpen}
          onOpenChange={setUpdatesOpen}
          updates={[]}
          onAddUpdate={(content: string) => {
            console.log("Adding update:", content)
          }}
          onDeleteUpdate={(id: string) => {
            console.log("Deleting update:", id)
          }}
        />

        <LaunchProgramDialog
          open={launchProgramOpen}
          onOpenChange={setLaunchProgramOpen}
          onSubmitFeedback={(feedback: string) => {
            console.log("Submitting feedback:", feedback)
          }}
        />

        <InsightsDialog
          open={insightsOpen}
          onOpenChange={setInsightsOpen}
        />
      </div>
    </div>
  )
} 