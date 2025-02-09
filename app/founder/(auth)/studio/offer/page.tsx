"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Undo2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileHoverCard } from "@/components/ui/hover-card-profile";
import formatDate from "@/lib/formatDate";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Offer interface
interface Offer {
  id: string;
  scoutName: string;
  collaboration: string[];
  acceptedBy?: string;
  status: "pending" | "completed" | "declined" | "withdrawn";
  type: "received" | "accepted" | "withdrawn";
  date: string;
  logs?: {
    action: string;
    timestamp: string;
    user: string;
  }[];
}

// Generate random scout names and user names for logs
const scoutNames = ["Women's Fund", "Pitchbook", "YC 2025", "GUSEC Spring 2025"];
const randomUsers = ["Alex Johnson", "Emily Smith", "Michael Brown", "Sophia Wilson", "Daniel Lee"];

// Function to generate a random user name
const getRandomUser = () => randomUsers[0];

// Dummy Offer Data with Logs and Randomized Scouts
const dummyOffers: Offer[] = [
  {
    id: "1",
    scoutName: scoutNames[0],
    collaboration: ["IIM A", "Nitin Kamath", "Ravikewal Ramani"],
    status: "pending",
    type: "received",
    date: formatDate(new Date().toISOString()),
    logs: [
      {
        action: "Offer Received",
        timestamp: formatDate(new Date().toISOString()),
        user: getRandomUser(),
      },
    ],
  },
  {
    id: "2",
    scoutName: scoutNames[1],
    collaboration: ["IIM B", "John Doe", "Jane Smith"],
    acceptedBy: getRandomUser(),
    status: "completed",
    type: "accepted",
    date: formatDate(new Date().toISOString()),
    logs: [
      {
        action: "Offer Received",
        timestamp: formatDate(new Date().toISOString()),
        user: getRandomUser(),
      },
      {
        action: "Offer Accepted",
        timestamp: formatDate(new Date().toISOString()),
        user: getRandomUser(),
      },
    ],
  },
  {
    id: "3",
    scoutName: scoutNames[2],
    collaboration: ["IIM C", "Alice Brown", "Bob Wilson"],
    status: "declined",
    type: "withdrawn",
    date: formatDate(new Date().toISOString()),
    logs: [
      {
        action: "Offer Received",
        timestamp: formatDate(new Date().toISOString()),
        user: getRandomUser(),
      },
      {
        action: "Offer Declined",
        timestamp: formatDate(new Date().toISOString()),
        user: getRandomUser(),
      },
    ],
  },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(dummyOffers);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { toast } = useToast();
  const [historyFilter, setHistoryFilter] = useState<"all" | "completed" | "declined" | "withdrawn">("all");

  const handleStatusUpdate = (id: string, type: "accepted" | "withdrawn", status: "completed" | "declined") => {
    setOffers(prev =>
      prev.map(offer => {
        if (offer.id === id) {
          return {
            ...offer,
            status,
            type,
            acceptedBy: status === "completed" ? getRandomUser() : undefined,
            logs: [
              {
                action: status === "completed" ? "Offer Accepted" : "Offer Declined",
                timestamp: formatDate(new Date().toISOString()),
                user: getRandomUser(),
              },
              ...(offer.logs || []),
            ],
          };
        }
        return offer;
      })
    );
    setSelectedOffer(null);

    toast({
      title: `Offer ${status === "completed" ? "Accepted" : "Declined"}`,
      description: `The offer from ${offers.find(o => o.id === id)?.scoutName} has been ${status === "completed" ? "accepted" : "declined"
        }.`,
      variant: type === "accepted" ? "success" : "destructive",
    });
  };

  const handleWithdraw = (id: string) => {
    setOffers(prev =>
      prev.map(offer => {
        if (offer.id === id && offer.status === "completed") {
          return {
            ...offer,
            status: "withdrawn",
            type: "withdrawn",
            acceptedBy: undefined,
            logs: [
              {
                action: "Offer Withdrawn",
                timestamp: formatDate(new Date().toISOString()),
                user: getRandomUser(),
              },
              ...(offer.logs || []),
            ],
          };
        }
        return offer;
      })
    );

    toast({
      title: "Offer Withdrawn",
      description: "The accepted offer has been successfully withdrawn.",
      variant: "default",
    });
  };

  const pendingOffers = offers.filter(o => o.status === "pending");
  const logOffers = offers.filter(o => {
    if (historyFilter === "all") return o.status !== "pending";
    if (historyFilter === "withdrawn") return o.type === "withdrawn";
    return o.status === historyFilter;
  });

  return (
    <div className="flex gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardHeader>
          <CardTitle> </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Pending Offers</h2>
            <div className={cn(
              "space-y-3",
              pendingOffers.length > 2 && "overflow-auto max-h-[300px] pr-4"
            )}>
              {pendingOffers.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onView={setSelectedOffer}
                  onAccept={() => handleStatusUpdate(offer.id, "accepted", "completed")}
                  onDecline={() => handleStatusUpdate(offer.id, "withdrawn", "declined")}
                />
              ))}
              {pendingOffers.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No pending offers</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Offer History</h2>
              <Select 
                value={historyFilter} 
                onValueChange={(value: "all" | "completed" | "declined" | "withdrawn") => setHistoryFilter(value)}
              >
                <SelectTrigger className="w-[180px] bg-muted/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All History</SelectItem>
                  <SelectItem value="completed">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={cn(
              "space-y-3",
              logOffers.length > 3 && "overflow-auto max-h-[400px] pr-4"
            )}>
              {logOffers.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onView={setSelectedOffer}
                  onWithdraw={handleWithdraw}
                />
              ))}
              {logOffers.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No offer history</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OfferCard({
  offer,
  onView,
  onAccept,
  onDecline,
  onWithdraw,
}: {
  offer: Offer;
  onView: (offer: Offer) => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onWithdraw?: (id: string) => void;
}) {
  // Helper function to get status text
  const getStatusInfo = () => {
    const lastLog = offer.logs?.[0];
    if (!lastLog) return null;

    switch (offer.status) {
      case "completed":
        return `Accepted by: ${offer.acceptedBy}`;
      case "declined":
        return `Declined by: ${lastLog.user}`;
      case "withdrawn":
        return `Withdrawn by: ${lastLog.user}`;
      default:
        return null;
    }
  };

  return (
    <div onClick={() => onView(offer)} className="flex flex-col p-4 border rounded-lg transition-colors">
      <time className="text-xs text-muted-foreground">{offer.date}</time>
      <p className="text-lg font-medium">{offer.scoutName}</p>
      <p className="text-sm text-muted-foreground">Collaboration: {offer.collaboration.join(", ")}</p>
      
      {/* Status Information */}
      {offer.status !== "pending" && (
        <p className="text-sm text-muted-foreground mt-1">
          {getStatusInfo()}
        </p>
      )}

      <div className="flex w-full items-center gap-2 mt-2">
        {offer.status === "pending" && (
          <div className="flex w-full items-center gap-2">
            <Button className="w-full bg-muted hover:bg-muted/50" variant="ghost" onClick={onAccept}>
              Accept
            </Button>
            <Button className="w-full bg-muted hover:bg-muted/50" variant="ghost" onClick={onDecline}>
              Decline
            </Button>
          </div>
        )}

        {offer.status === "completed" && (
          <Button className="w-full px-20 bg-muted text-white" variant="ghost" onClick={() => onWithdraw?.(offer.id)}>
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
}
