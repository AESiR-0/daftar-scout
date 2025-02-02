"use client"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart2, MapPin } from "lucide-react"

interface InsightsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TimelineEvent {
  date: string
  title: string
  description: string
  type: 'pitch' | 'meeting' | 'update'
}

const timelineEvents: TimelineEvent[] = [
  {
    date: "Mar 15, 2024",
    title: "New Pitch Received",
    description: "AI-driven healthcare solution from MedTech Inc.",
    type: "pitch"
  },
  {
    date: "Mar 14, 2024",
    title: "Meeting Scheduled",
    description: "Follow-up with TechCorp founders",
    type: "meeting"
  },
  {
    date: "Mar 13, 2024",
    title: "Program Update",
    description: "Q1 objectives review completed",
    type: "update"
  },
  // Add more timeline events as needed
]

export function InsightsDialog({ open, onOpenChange }: InsightsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-[0.3rem] bg-accent/50">
              <BarChart2 className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold">Program Insights</h2>
          </div>

          <ScrollArea className="h-[32rem] pr-4">
            <div className="space-y-6">
              {/* Map Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Geographic Distribution</h3>
                </div>
                <div className="h-[300px] bg-muted/20 rounded-[0.3rem] flex items-center justify-center">
                  {/* Replace this div with your actual map component */}
                  <span className="text-sm text-muted-foreground">Map Component Goes Here</span>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Activity Timeline</h3>
                <div className="relative space-y-4">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      {/* Timeline connector */}
                      <div className="relative flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                        {index !== timelineEvents.length - 1 && (
                          <div className="w-[2px] h-full bg-border absolute top-2" />
                        )}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 pb-4">
                        <div className="p-3 border rounded-[0.3rem] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {event.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {event.date}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 