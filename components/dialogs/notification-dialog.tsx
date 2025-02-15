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
type NotificationTab = "updates" | "alerts" | "news"

interface NotificationItem {
  id: string
  title: string
  description: string
  date: string
  isRead: boolean
  type: NotificationTab
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

export function NotificationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [activeTab, setActiveTab] = useState<NotificationTab>("updates")
  const filteredNotifications = notifications.filter(n => n.type === activeTab)

  // Add counts for each tab
  const tabCounts = {
    updates: notifications.filter(n => n.type === "updates").length,
    alerts: notifications.filter(n => n.type === "alerts").length,
    news: notifications.filter(n => n.type === "news").length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex gap-0">
        {/* Side Navigation */}
        <div className="w-[200px] border-r bg-[#0e0e0e]">
          <div className="flex flex-col space-y-1 p-4">
            <DialogHeader className="mb-4">
              <DialogTitle>Notifications</DialogTitle>
            </DialogHeader>
            {["updates", "alerts", "news"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as NotificationTab)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-muted/50",
                  activeTab === tab ? "bg-muted" : "transparent"
                )}
              >
                <span className="capitalize">{tab}</span>
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
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
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
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}