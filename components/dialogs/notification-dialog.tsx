"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import formatDate from "@/lib/formatDate"
import { Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

type NotificationTab = "updates" | "alerts" | "news" | "scout-requests" | "scout-links"

interface NotificationItem {
  id: string
  title: string
  description: string
  date: string
  isRead: boolean
  type: NotificationTab
}

interface ScoutRequest {
  id: string;
  scoutName: string;
  scoutVision: string;
  daftarName: string;
  requestedAt: string;
  status?: {
    action: "accepted" | "declined";
    by: string;
    designation: string;
    timestamp: string;
  };
}

interface ScoutLink {
  id: string;
  scoutName: string;
  daftar: string;
  createdAt: string;
  status: "active" | "inactive";
  collaborators: number;
}

const notifications: NotificationItem[] = [
  {
    id: "1",
    title: "New Pitch Received",
    description: "You have received a new pitch from Tech Startup Inc.",
    date: "Feb 14, 2025, 10:00 AM",
    isRead: false,
    type: "updates"
  },
  {
    id: "2",
    title: "Meeting Reminder",
    description: "Upcoming meeting with investors tomorrow at 2 PM",
    date: "Feb 14, 2025, 10:00 AM",
    isRead: true,
    type: "alerts"
  },
  {
    id: "3",
    title: "Platform Update",
    description: "New features have been added to the platform",
    date: "Feb 14, 2025, 10:00 AM",
    isRead: true,
    type: "news"
  }
]

const scoutRequests: ScoutRequest[] = [
  {
    id: "1",
    scoutName: "Tech Innovators Scout",
    scoutVision: "Connecting innovative startups with strategic investors in the deep tech space",
    daftarName: "Tech Innovators",
    requestedAt: "Feb 14, 2024, 10:00 AM",
  },
  {
    id: "2",
    scoutName: "FinTech Future Scout",
    scoutVision: "Building bridges between emerging fintech solutions and growth capital",
    daftarName: "FinTech Solutions",
    requestedAt: "Feb 13, 2024, 2:30 PM",
    status: {
      action: "accepted",
      by: "John Smith",
      designation: "Investment Director",
      timestamp: "Feb 13, 2024, 3:45 PM"
    }
  }
]

const scoutLinks: ScoutLink[] = [
  {
    id: "1",
    scoutName: "Tech Innovators Scout",
    daftar: "Tech Innovators",
    createdAt: "Feb 20, 2024",
    status: "active",
    collaborators: 3
  },
  {
    id: "2",
    scoutName: "FinTech Scout",
    daftar: "FinTech Solutions",
    createdAt: "Feb 15, 2024",
    status: "active",
    collaborators: 2
  },
  {
    id: "3",
    scoutName: "Health Tech Scout",
    daftar: "Health Innovations",
    createdAt: "Jan 10, 2024",
    status: "inactive",
    collaborators: 0
  }
]

export function NotificationDialog({
  open,
  onOpenChange,
  role = "founder"
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: "founder" | "investor" | undefined;
}) {
  const [activeTab, setActiveTab] = useState<NotificationTab>(role === "investor" ? "scout-requests" : "updates");
  const [requests, setRequests] = useState<ScoutRequest[]>(scoutRequests);
  const [links] = useState<ScoutLink[]>(scoutLinks);
  const router = useRouter();

  // Get available tabs based on role
  const availableTabs = role === "investor" 
    ? ["scout-requests", "scout-links", "updates", "alerts", "news"]
    : ["updates", "alerts", "news"];

  // Add counts for each tab
  const tabCounts = {
    updates: notifications.filter(n => n.type === "updates").length,
    alerts: notifications.filter(n => n.type === "alerts").length,
    news: notifications.filter(n => n.type === "news").length,
    "scout-requests": scoutRequests.length
  }

  const handleAction = (requestId: string, action: "accepted" | "declined") => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: {
            action,
            by: "John Smith", // Replace with actual user
            designation: "Investment Director", // Replace with actual designation
            timestamp: formatDate(new Date().toLocaleString())
          }
        };
      }
      return req;
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex gap-0">
        <div className="w-[200px] border-r bg-[#0e0e0e]">
          <div className="flex flex-col space-y-1 p-4">
            <DialogHeader className="mb-4">
              <DialogTitle>Notifications</DialogTitle>
            </DialogHeader>
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as NotificationTab)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-muted/50",
                  activeTab === tab ? "bg-muted" : "transparent"
                )}
              >
                <span className="capitalize">{tab.replace("-", " ")}</span>
                <Badge className="text-xs text-muted-foreground bg-muted">
                  {tabCounts[tab as keyof typeof tabCounts]}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 bg-[#0e0e0e] pt-10">
          <ScrollArea className="h-[500px]">
            {activeTab === "scout-requests" ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="border-none bg-[#1a1a1a] hover:bg-muted/10 transition-colors">
                    <div className="p-4 space-y-4">
                      <div className="">
                        <h4 className="text-sm font-medium">{request.scoutName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.scoutVision}
                        </p>
                      </div>
                      <div className="">
                        <p className="text-xs text-muted-foreground">
                          Daftar: {request.daftarName}
                        </p>
                        <time className="text-xs text-muted-foreground block">
                          Requested on {request.requestedAt}
                        </time>
                      </div>

                      {request.status ? (
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          <p>
                            {request.status.action === "accepted" ? "Accepted" : "Declined"} by{" "}
                            {request.status.by}
                          </p>
                          <p>{request.status.timestamp}</p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAction(request.id, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAction(request.id, "declined")}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : activeTab === "scout-links" ? (
              <div className="space-y-4">
                {links.map((link) => (
                  <Card 
                    key={link.id} 
                    className="border-none bg-[#1a1a1a] hover:bg-muted/10 transition-colors"
                  >
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{link.scoutName}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Daftar: {link.daftar}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created on {link.createdAt}</span>
                        <span>{link.collaborators} collaborators</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            // Handle copy link
                            navigator.clipboard.writeText(`https://daftar.com/scout/${link.id}`)
                            toast({
                              title: "Link copied",
                              description: "Scout link has been copied to clipboard"
                            })
                          }}
                        >
                          Copy Link
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => router.push(`/investor/studio/${link.id}`)}
                        >
                          View Scout
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.filter(n => n.type === activeTab).length > 0 ? (
                  notifications.filter(n => n.type === activeTab).map((notification) => (
                    <Card key={notification.id} className={cn(
                      "border-none bg-[#1a1a1a] hover:bg-muted/10 transition-colors",
                      !notification.isRead && "border-l-2 border-l-primary"
                    )}>
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <time className="text-xs text-muted-foreground">
                          {notification.date}
                        </time>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    No {activeTab} to show
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}