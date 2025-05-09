"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import formatDate from "@/lib/formatDate";
import { usePathname } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/createClient";
import { useDaftar } from "@/lib/context/daftar-context";
import { sendNotificationEmail } from "@/lib/notifications/listen";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export type NotificationType =
  | "news"
  | "updates"
  | "alert"
  | "scout_link"
  | "request";

export type NotificationRole = "founder" | "investor" | "both";

export interface NotificationPayload {
  action?: string;
  by_user_id?: string;
  daftar_id?: string;
  action_by?: string;
  action_at?: string;
  scout_id?: string;
  url?: string;
  pitchName?: string;
  pitchId?: string;
}

type NotificationDetails = {
  pitchName?: string;
  scoutName?: string;
  daftarName?: string;
};

type Notification = {
  id: string;
  title?: string;
  description?: string;
  type: NotificationType;
  role: NotificationRole;
  targeted_users: string[];
  payload: NotificationPayload;
  created_at: string;
};

type UITab = "updates" | "alerts" | "news" | "scout-requests" | "scout-links";

const emptyStateMessages: Record<UITab, string> = {
  "scout-requests":
    "If a Daftar requests to collaborate with you, you'll see the notification here.",
  "scout-links":
    "Once your Daftar creates a scout and it goes live, you'll receive a unique scout application link right here.\n\nFeel free to share this link with founders in your social network anyone you think could be a great fit. Founders can use it to view your scout and apply directly.\n\nTeam Daftar",
  updates: "Looks empty here for now.",
  alerts: "Looks empty here for now.",
  news: "When a startup gets selected at Daftar, we'll share the news here.",
};

export function NotificationDialog({
  open,
  onOpenChange,
  role = "founder",
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: "founder" | "investor" | undefined;
  userId: string;
}) {
  const [activeTab, setActiveTab] = useState<UITab>(
    role === "investor" ? "scout-requests" : "updates"
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationDetails, setNotificationDetails] = useState<Record<string, NotificationDetails>>({});

  const pathname = usePathname();
  const scoutId =
    role == "investor" ? pathname.split("/")[3] : pathname.split("/"[2]);
  const daftarId = role == "investor" ? useDaftar().selectedDaftar : "";

  // Get available tabs based on role
  const availableTabs =
    role === "investor"
      ? ["scout-requests", "scout-links", "updates", "alerts", "news"]
      : ["updates", "alerts", "news"];

  // Map notification type to UI tab
  const getUITab = (type: NotificationType): UITab => {
    const typeMap: { [key in NotificationType]: UITab } = {
      updates: "updates",
      alert: "alerts",
      news: "news",
      request: "scout-requests",
      scout_link: "scout-links",
    };
    return typeMap[type];
  };

  // Fetch all notifications from Supabase on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const filteredNotifications = data.filter(
          (notif: Notification) =>
            (notif.targeted_users.length === 0 ||
              notif.targeted_users.includes(userId)) &&
            (notif.role === "both" || notif.role === role)
        );
        console.log("Filtered Notifications:", filteredNotifications);
        setNotifications(filteredNotifications);
      }
    };

    fetchNotifications();
  }, [userId, role]);

  // Real-time listener for Supabase notifications
  useEffect(() => {
    const subscription = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          const notif = payload.new as Notification;
          const isTargeted =
            notif.targeted_users.length === 0 ||
            notif.targeted_users.includes(userId);

          const roleMatches = notif.role === "both" || notif.role === role;

          if (isTargeted && roleMatches) {
            setNotifications((prev) => [...prev, notif]);
            toast({
              title: `New notification: ${notif.title || notif.type}`,
              variant: "default",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, role]);

  useEffect(() => {
    const fetchDetails = async () => {
      const res = fetch(
        `/api/endpoints/notifications?userId=${userId}&scoutId=${notifications[0]?.payload?.scout_id}&daftarId=${notifications[0]?.payload?.daftar_id}`
      );
    };
  });

  // Add counts for each tab
  const tabCounts = {
    updates: notifications.filter((n) => n.type === "updates").length,
    alerts: notifications.filter((n) => n.type === "alert").length,
    news: notifications.filter((n) => n.type === "news").length,
    "scout-requests": notifications.filter((n) => n.type === "request").length,
    "scout-links": notifications.filter((n) => n.type === "scout_link").length,
  };

  // Local state to track scout request statuses
  const [requestStatuses, setRequestStatuses] = useState<{
    [key: string]: {
      action: "accepted" | "declined";
      by: string;
      designation: string;
      timestamp: string;
    };
  }>({});

  const handleAction = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    const notification = notifications.find((n) => n.id === requestId);
    if (!notification) return;

    const res = await fetch("/api/endpoints/scouts/collaboration/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        daftarId,
        scoutId,
        action,
        userId,
      }),
    });

    if (res.status === 200) {
      const data = await res.json();
      const user = data.user;

      toast({
        title: `Request ${action}`,
        description: `${action === "accept" ? "Accepted" : "Rejected"} by ${user.firstName
          } ${user.lastName}`,
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === requestId
            ? {
              ...n,
              status: action, // or a separate field like n.actionStatus
              handledBy: user,
            }
            : n
        )
      );
    } else {
      toast({
        title: "Failed",
        description: `Unable to ${action} the request.`,
        variant: "destructive",
      });
    }
  };

  // Fetch details for notifications
  useEffect(() => {
    const fetchNotificationDetails = async (notification: Notification) => {
      if (!notification.payload.scout_id && !notification.payload.pitchId) return;

      try {
        const res = await fetch(
          `/api/endpoints/notifications/details?${
            notification.payload.scout_id ? `scoutId=${notification.payload.scout_id}` : ''
          }${
            notification.payload.pitchId ? `&pitchId=${notification.payload.pitchId}` : ''
          }${
            notification.payload.daftar_id ? `&daftarId=${notification.payload.daftar_id}` : ''
          }`
        );
        
        if (!res.ok) throw new Error('Failed to fetch details');
        
        const data = await res.json();
        setNotificationDetails(prev => ({
          ...prev,
          [notification.id]: data
        }));
      } catch (error) {
        console.error('Error fetching notification details:', error);
      }
    };

    notifications.forEach(notification => {
      if (notification.type === 'request' || notification.type === 'updates' || notification.type === 'scout_link') {
        fetchNotificationDetails(notification);
      }
    });
  }, [notifications]);

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
                onClick={() => setActiveTab(tab as UITab)}
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

        <div className="flex-1 p-6 bg-[#0e0e0e] pt-10">
          <ScrollArea className="h-[500px]">
            {activeTab === "scout-requests" ? (
              <div className="space-y-4">
                {notifications.filter((n) => n.type === "request").length >
                  0 ? (
                  notifications
                    .filter((n) => n.type === "request")
                    .map((notification, idx) => (
                      <Card
                        key={idx}
                        className="border-none bg-[#1a1a1a] hover:bg-muted/10 transition-colors"
                      >
                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            <h1>Collaboration</h1>
                            {notificationDetails[notification.id]?.scoutName && (
                              <p className="text-sm text-muted-foreground">
                                Scout: {notificationDetails[notification.id].scoutName}
                              </p>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {notification.payload.action === "pending"
                              ? ""
                              : notification.payload.action}
                          </p>
                          <div className="space-y-1">
                            {notificationDetails[notification.id]?.daftarName && (
                              <p className="text-xs text-muted-foreground">
                                Daftar: {notificationDetails[notification.id].daftarName}
                              </p>
                            )}
                            <time className="text-xs text-muted-foreground block">
                              Requested on {formatDate(notification.created_at)}
                            </time>
                          </div>

                          {requestStatuses[notification.id] ? (
                            <div className="text-xs text-muted-foreground border-t pt-2">
                              <p>
                                {requestStatuses[notification.id].action ===
                                  "accepted"
                                  ? "Accepted"
                                  : "Declined"}{" "}
                                by {requestStatuses[notification.id].by}
                              </p>
                              <p>
                                {formatDate(
                                  requestStatuses[notification.id].timestamp
                                )}
                              </p>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-[0.35rem]"
                                onClick={() =>
                                  handleAction(notification.id, "accept")
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-[0.35rem]"
                                onClick={() =>
                                  handleAction(notification.id, "reject")
                                }
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground mt-5 text-left ">
                    {emptyStateMessages["scout-requests"]}
                  </p>
                )}
              </div>
            ) : activeTab === "scout-links" ? (
              <div className="space-y-4">
                {notifications.filter((n) => n.type === "scout_link").length >
                  0 ? (
                  notifications
                    .filter((n) => n.type === "scout_link")
                    .map((notification, idx) => (
                      <Card
                        key={idx}
                        className="border-none bg-[#1a1a1a] hover:bg-muted/10 transition-colors"
                      >
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                              {notificationDetails[notification.id]?.scoutName
                                ? `Scout Link: ${notificationDetails[notification.id].scoutName}`
                                : "Scout Link"}
                            </h4>
                          </div>
                          {notificationDetails[notification.id]?.daftarName && (
                            <p className="text-xs text-muted-foreground">
                              Daftar: {notificationDetails[notification.id].daftarName}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Created on {formatDate(notification.created_at)}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs rounded-[0.35rem]"
                              onClick={() => {
                                const link =
                                  notification.payload.url ||
                                  `https://daftar.com/scout/${notification.id}`;
                                navigator.clipboard.writeText(link);
                                toast({
                                  title: "Link copied",
                                  description:
                                    "Scout link has been copied to clipboard",
                                });
                              }}
                            >
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground mt-5 text-left whitespace-pre-line">
                    {emptyStateMessages["scout-links"]}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.filter((n) => getUITab(n.type) === activeTab)
                  .length > 0 ? (
                  notifications
                    .filter((n) => getUITab(n.type) === activeTab)
                    .map((notification, idx) => (
                      <Card
                        key={idx}
                        className={cn(
                          "border-none bg-[#1a1a1a] hover:bg-muted/10 transition-colors"
                        )}
                      >
                        <div className="p-4 space-y-2">
                          <h4 className="text-sm font-medium">
                            {notification.title || "Notification"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {notification.description
                              ? notification.description
                              : "No additional details"}
                          </p>
                          {notificationDetails[notification.id] && (
                            <div className="space-y-1 mt-2">
                              {notificationDetails[notification.id].pitchName && (
                                <p className="text-xs text-muted-foreground">
                                  Pitch: {notificationDetails[notification.id].pitchName}
                                </p>
                              )}
                              {notificationDetails[notification.id].scoutName && (
                                <p className="text-xs text-muted-foreground">
                                  Scout: {notificationDetails[notification.id].scoutName}
                                </p>
                              )}
                            </div>
                          )}
                          <time className="text-xs text-muted-foreground">
                            {formatDate(notification.created_at)}
                          </time>
                        </div>
                      </Card>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    {emptyStateMessages[activeTab]}
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
