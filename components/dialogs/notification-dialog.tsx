"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Bell, MessageSquare, AlertTriangle, RefreshCcw, Link2, BookOpen, Check, X } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

const sections = [
  { id: "requests", label: "Requests", count: 3 },
  { id: "alerts", label: "Alerts", count: 2 },
  { id: "updates", label: "Updates", count: 4 },
  { id: "program-links", label: "Program Links", count: 2 },
  { id: "stories", label: "Stories", count: 5 }
]

interface NotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Simulated live data updates
const generateLiveData = () => {
  const now = new Date()
  return {
    requests: [
      {
        id: "1",
        type: "program",
        title: "Program Invitation",
        program: "Tech Innovation Fund",
        daftar: "Daftar OS",
        role: "Lead Investor",
        date: new Date(now.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
        status: "pending",
        priority: "high"
      },
      {
        id: "2",
        type: "team",
        title: "Team Invitation",
        daftar: "MedTech Hub",
        role: "Mentor",
        date: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
        status: "pending",
        priority: "medium"
      }
    ],
    alerts: [
      {
        id: "1",
        title: "Meeting in 30 minutes",
        message: "Upcoming meeting with Tech Startup team",
        type: "meeting",
        date: new Date(now.getTime() + 30 * 60000).toISOString(),
        priority: "high"
      },
      {
        id: "2",
        title: "Document Review Required",
        message: "Financial model needs your review",
        type: "document",
        date: new Date(now.getTime() + 2 * 3600000).toISOString(),
        priority: "medium"
      }
    ],
    updates: [
      {
        id: "1",
        title: "Portfolio Update",
        message: "TechStart Inc. reached $1M ARR milestone",
        type: "milestone",
        date: new Date(now.getTime() - 1 * 3600000).toISOString(),
        priority: "medium"
      },
      {
        id: "2",
        title: "Investment Round Closed",
        message: "MedTech Hub successfully closed Series A",
        type: "investment",
        date: new Date(now.getTime() - 2 * 3600000).toISOString(),
        priority: "high"
      }
    ],
    "program-links": [
      {
        id: "1",
        title: "New Program Available",
        message: "AI Accelerator Program open for applications",
        link: "/programs/ai-accelerator",
        date: new Date(now.getTime() - 12 * 3600000).toISOString(),
        priority: "high"
      },
      {
        id: "2",
        title: "Program Update",
        message: "Climate Tech Fund - New resources added",
        link: "/programs/climate-tech",
        date: new Date(now.getTime() - 24 * 3600000).toISOString(),
        priority: "medium"
      }
    ],
    stories: [
      {
        id: "1",
        title: "Founder Story: From Idea to IPO",
        message: "Read how TechStart transformed the industry",
        type: "success-story",
        date: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(),
        priority: "medium"
      },
      {
        id: "2",
        title: "Investment Journey",
        message: "Key lessons from our top performing portfolio",
        type: "case-study",
        date: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(),
        priority: "low"
      }
    ]
  }
}

const navItems = [
  { title: "Requests", value: "requests", icon: MessageSquare, count: sections[0].count },
  { title: "Alerts", value: "alerts", icon: AlertTriangle, count: sections[1].count },
  { title: "Updates", value: "updates", icon: RefreshCcw, count: sections[2].count },
  { title: "Program Links", value: "program-links", icon: Link2, count: sections[3].count },
  { title: "Stories", value: "stories", icon: BookOpen, count: sections[4].count }
]

export function NotificationDialog({ open, onOpenChange }: NotificationDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("requests")
  const [data, setData] = useState(generateLiveData())
  const [date, setDate] = useState<Date | undefined>(undefined)

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateLiveData())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleAccept = (request: typeof data.requests[0]) => {
    toast({
      title: (
        "Request Accepted"
      ),
      description: `You've accepted the ${request.type} invitation from ${request.daftar}`,
      variant: "default",
      className: "border-green-500/20 bg-green-500/10",
    })

    // Update local state
    setData(prev => ({
      ...prev,
      requests: prev.requests.filter(r => r.id !== request.id)
    }))
  }

  const handleDecline = (request: typeof data.requests[0]) => {
    toast({
      title: (
        "Request Declined"
      ),
      description: `You've declined the ${request.type} invitation from ${request.daftar}`,
      variant: "destructive",
      className: "border-red-500/20 bg-red-500/10",
    })

    setData(prev => ({
      ...prev,
      requests: prev.requests.filter(r => r.id !== request.id)
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()

    if (diff < 0) {
      // Future date
      const minutes = Math.abs(Math.floor(diff / 60000))
      if (minutes < 60) return `in ${minutes}m`
      return `in ${Math.floor(minutes / 60)}h`
    }

    // Past date
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  const filterByDate = (itemDate: string) => {
    if (!date) return true
    
    const compareDate = new Date(itemDate)
    return compareDate.toDateString() === date.toDateString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0">
        {/* Top Navigation */}
        <div className="border-b">
          <nav className="flex items-center space-x-1 px-4 h-14">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={cn(
                  "relative px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-accent/50",
                  activeTab === item.value
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.count > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 px-1.5"
                    >
                      {item.count}
                    </Badge>
                  )}
                </span>
                {activeTab === item.value && (
                  <span className="absolute inset-x-0 -bottom-[10px] h-[2px] bg-foreground" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <ScrollArea className="h-[calc(600px-3.5rem)]">
          <div className="p-6">
            {/* Enhanced Filter */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                {navItems.find(item => item.value === activeTab)?.title}
              </h2>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[200px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>{date ? format(date, "PPP") : "Pick a date"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {date && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDate(undefined)}
                    className="h-9 w-9 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Notification Cards */}
            <div className="space-y-4">
              {activeTab === "requests" && data.requests
                .filter(request => filterByDate(request.date))
                .map((request) => (
                  <div
                    key={request.id}
                    className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/50"
                  >
                    <div className="flex justify-between gap-4">
                      {/* Left Column - Details */}
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-medium">{request.title}</h3>
                          <p className="text-sm text-muted-foreground">{request.daftar}</p>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Role:</span> {request.role}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Program:</span> {request.program}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Buttons */}
                      <div className="flex flex-col justify-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request)}
                          className="bg-primary hover:bg-primary/90 w-24"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDecline(request)}
                          className="text-destructive hover:bg-destructive/10 w-24"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                    <div className="text-right mt-2">
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(request.date)}</span>
                    </div>
                  </div>
                ))}

              {activeTab === "alerts" && data.alerts
                .filter(alert => filterByDate(alert.date))
                .map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/50"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <div className="text-right mt-2">
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(alert.date)}</span>
                    </div>
                  </div>
                ))}

              {activeTab === "updates" && data.updates
                .filter(update => filterByDate(update.date))
                .map((update) => (
                  <div
                    key={update.id}
                    className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/50"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium">{update.title}</h3>
                        <p className="text-sm text-muted-foreground">{update.message}</p>
                      </div>
                    </div>
                    <div className="text-right mt-2">
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(update.date)}</span>
                    </div>
                  </div>
                ))}

              {activeTab === "program-links" && data["program-links"]
                .filter(item => filterByDate(item.date))
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/50"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.message}</p>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          View Program
                        </Button>
                      </div>
                    </div>
                    <div className="text-right mt-2">
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(item.date)}</span>
                    </div>
                  </div>
                ))}

              {activeTab === "stories" && data.stories
                .filter(story => filterByDate(story.date))
                .map((story) => (
                  <div
                    key={story.id}
                    className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/50"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium">{story.title}</h3>
                        <p className="text-sm text-muted-foreground">{story.message}</p>
                        <Button variant="link" className="p-0 h-auto text-xs">
                          Read More
                        </Button>
                      </div>
                    </div>
                    <div className="text-right mt-2">
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(story.date)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}