"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart2, MapPin, TrendingUp, Users, Target, Clock } from "lucide-react"

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

const scoutMetrics = {
  totalPitches: 24,
  acceptedPitches: 8,
  conversionRate: "33%",
  avgResponseTime: "2.5 days",
  topSectors: ["FinTech", "HealthTech", "AI/ML"],
  recentActivity: {
    lastWeek: 12,
    trend: "+20%"
  }
}

const timelineEvents: TimelineEvent[] = [
  {
    date: "Mar 15, 2024",
    title: "High Conversion Achievement",
    description: "Reached 33% pitch-to-acceptance rate this month",
    type: "update"
  },
  {
    date: "Mar 14, 2024",
    title: "Response Time Improvement",
    description: "Average response time decreased to 2.5 days",
    type: "update"
  },
  {
    date: "Mar 13, 2024",
    title: "Sector Specialization",
    description: "Strong performance in FinTech sector with 5 successful pitches",
    type: "update"
  },
]

export function InsightsDialog({ open, onOpenChange }: InsightsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle></DialogTitle>
      </DialogHeader>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-[0.3rem] bg-accent/50">
              <BarChart2 className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold">Scout Performance</h2>
          </div>

          <ScrollArea className="h-[32rem] pr-4">
            <div className="space-y-6">
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-[0.3rem] space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 " />
                    <span className="text-sm font-medium">Conversion Rate</span>
                  </div>
                  <p className="text-2xl font-bold">{scoutMetrics.conversionRate}</p>
                  <p className="text-xs text-muted-foreground">Of pitches accepted</p>
                </div>

                <div className="p-4 border rounded-[0.3rem] space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Avg Response Time</span>
                  </div>
                  <p className="text-2xl font-bold">{scoutMetrics.avgResponseTime}</p>
                  <p className="text-xs text-muted-foreground">To review pitches</p>
                </div>

                <div className="p-4 border rounded-[0.3rem] space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 " />
                    <span className="text-sm font-medium">Recent Activity</span>
                  </div>
                  <p className="text-2xl font-bold">{scoutMetrics.recentActivity.lastWeek}</p>
                  <p className="text-xs">
                    {scoutMetrics.recentActivity.trend} from last week
                  </p>
                </div>
              </div>

              {/* Top Sectors */}
              <div className="p-4 border rounded-[0.3rem] space-y-3">
                <h3 className="text-sm font-medium">Top Performing Sectors</h3>
                <div className="flex gap-2">
                  {scoutMetrics.topSectors.map((sector, index) => (
                    <div 
                      key={sector}
                      className="px-3 py-1 bg-accent/50 rounded-full text-xs"
                    >
                      {sector}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Performance Milestones</h3>
                <div className="relative space-y-4">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        {index !== timelineEvents.length - 1 && (
                          <div className="w-[2px] h-full bg-border absolute top-2" />
                        )}
                      </div>

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