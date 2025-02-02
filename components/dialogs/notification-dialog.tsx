"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Bell, MessageSquare, AlertTriangle, RefreshCcw, Link2, BookOpen, Check, X } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

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
        date: new Date(now.getTime() + 30 * 60000).toISOString(), // 30 minutes from now
        priority: "high"
      },
      {
        id: "2",
        title: "Document Review Required",
        message: "Financial model needs your review",
        type: "document",
        date: new Date(now.getTime() + 2 * 3600000).toISOString(), // 2 hours from now
        priority: "medium"
      }
    ],
    // ... other sections with live timestamps
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
  const [filter, setFilter] = useState("all")

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
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Request Cards with Enhanced UI */}
            <div className="space-y-4">
              {activeTab === "requests" && data.requests
                .filter(request => filter === "all" || request.priority === filter)
                .map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h3 className="font-medium">{request.title}</h3>
                        <p className="text-sm text-muted-foreground">{request.daftar}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(request.priority)}
                      >
                        {request.priority}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                      <div>Role: {request.role}</div>
                      <div>Program: {request.program}</div>
                      <div className="col-span-2">
                        {formatTimeAgo(request.date)}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecline(request)}
                        className="text-red-500 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(request)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}

              {/* Similar enhanced UI for other sections... */}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}