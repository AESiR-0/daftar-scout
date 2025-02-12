"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Undo2, ChevronRight, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileHoverCard } from "@/components/ui/hover-card-profile";
import formatDate from "@/lib/formatDate";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FounderProfile, FounderProfileProps } from "@/components/FounderProfile";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    user: FounderProfileProps;
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
        user: {
          founder: {
            name: getRandomUser(),
            age: "25",
            email: "john.doe@example.com",
            phone: "1234567890",
            gender: "Male",
            location: "New York, NY",
            language: ["English", "Spanish"],
            imageUrl: "https://example.com/john-doe.jpg",
            designation: "Founder & CEO"
          }
        },
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
        user: {
          founder: {
            name: getRandomUser(),
            age: "25",
            email: "john.doe@example.com",
            phone: "1234567890",
            gender: "Male",
            location: "New York, NY",
            language: ["English", "Spanish"],
            imageUrl: "https://example.com/john-doe.jpg",
            designation: "Founder & CEO"
          }
        },
      },
      {
        action: "Offer Accepted",
        timestamp: formatDate(new Date().toISOString()),
        user: {
          founder: {
            name: getRandomUser(),
            age: "25",
            email: "john.doe@example.com",
            phone: "1234567890",
            gender: "Male",
            location: "New York, NY",
            language: ["English", "Spanish"],
            imageUrl: "https://example.com/john-doe.jpg",
            designation: "Founder & CEO"
          }
        },
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
        user: {
          founder: {
            name: getRandomUser(),
            age: "25",
            email: "john.doe@example.com",
            phone: "1234567890",
            gender: "Male",
            location: "New York, NY",
            language: ["English", "Spanish"],
            imageUrl: "https://example.com/john-doe.jpg",
            designation: "Founder & CEO"
          }
        },
      },
      {
        action: "Offer Declined",
        timestamp: formatDate(new Date().toISOString()),
        user: {
          founder: {
            name: getRandomUser(),
            age: "25",
            email: "john.doe@example.com",
            phone: "1234567890",
            gender: "Male",
            location: "New York, NY",
            language: ["English", "Spanish"],
            imageUrl: "https://example.com/john-doe.jpg",
            designation: "Founder & CEO"
          }
        },
      },
    ],
  },
];

export function MakeOfferSection() {
  const [offers, setOffers] = useState<Offer[]>(dummyOffers);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { toast } = useToast();
  const [historyFilter, setHistoryFilter] = useState<"all" | "completed" | "declined" | "withdrawn">("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    scoutName: "",
    collaboration: "",
    description: ""
  });

  // Add this check for pending offers
  const hasPendingOffer = offers.some(o => o.status === "pending");

  const handleStatusUpdate = (id: string, type: "accepted" | "withdrawn", status: "completed" | "declined") => {
    setOffers(prev =>
      prev.map(offer => {
        if (offer.id === id) {
          const newLog = {
            action: status === "completed" ? "Offer Accepted" : "Offer Declined",
            timestamp: formatDate(new Date().toISOString()),
            user: {
              founder: {
                name: getRandomUser(),
                age: "25",
                email: "john.doe@example.com",
                phone: "1234567890",
                gender: "Male",
                location: "New York, NY",
                language: ["English", "Spanish"],
                imageUrl: "https://example.com/john-doe.jpg",
                designation: "Founder & CEO"
              }
            },
          };
          return {
            ...offer,
            status,
            type,
            acceptedBy: status === "completed" ? getRandomUser() : undefined,
            logs: [newLog, ...(offer.logs || [])]
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
        if (offer.id === id) {
          const newLog = {
            action: "Offer Withdrawn",
            timestamp: formatDate(new Date().toISOString()),
            user: {
              founder: {
                name: getRandomUser(),
                age: "25",
                email: "john.doe@example.com",
                phone: "1234567890",
                gender: "Male",
                location: "New York, NY",
                language: ["English", "Spanish"],
                imageUrl: "https://example.com/john-doe.jpg",
                designation: "Founder & CEO"
              }
            },
          };
          return {
            ...offer,
            status: "withdrawn",
            type: "withdrawn",
            acceptedBy: undefined,
            logs: [newLog, ...(offer.logs || [])]
          };
        }
        return offer;
      })
    );

    toast({
      title: "Offer Withdrawn",
      description: "The offer has been successfully withdrawn.",
      variant: "default",
    });
  };

  // Modify handleCreateOffer to check for pending offers
  const handleCreateOffer = () => {
    if (hasPendingOffer) {
      toast({
        title: "Cannot Create Offer",
        description: "You already have a pending offer. Please withdraw it before creating a new one.",
        variant: "destructive",
      });
      return;
    }

    const collaborationArray = newOffer.collaboration
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    const newOfferData: Offer = {
      id: (offers.length + 1).toString(),
      scoutName: newOffer.scoutName,
      collaboration: collaborationArray,
      status: "pending",
      type: "received",
      date: formatDate(new Date().toISOString()),
      logs: [
        {
          action: "Offer Created",
          timestamp: formatDate(new Date().toISOString()),
          user: {
            founder: {
              name: getRandomUser(),
              age: "25",
              email: "john.doe@example.com",
              phone: "1234567890",
              gender: "Male",
              location: "New York, NY",
              language: ["English", "Spanish"],
              imageUrl: "https://example.com/john-doe.jpg",
              designation: "Founder & CEO"
            }
          },
        },
      ],
    };

    setOffers(prev => [newOfferData, ...prev]);
    setShowCreateModal(false);
    setNewOffer({ scoutName: "", collaboration: "", description: "" });

    toast({
      title: "Offer Created",
      description: "Your offer has been created successfully.",
      variant: "success",
    });
  };

  const pendingOffers = offers.filter(o => o.status === "pending");
  const logOffers = offers.filter(o => {
    if (historyFilter === "all") return o.status !== "pending";
    if (historyFilter === "withdrawn") return o.type === "withdrawn";
    return o.status === historyFilter;
  });

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  return (
    <div className="flex gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle></CardTitle>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-muted hover:bg-muted/50"
              variant="ghost"
              disabled={hasPendingOffer}
            >
              Create Offer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Pending Offer</h2>
            <div className={cn("space-y-3")}>
              {pendingOffers.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onView={handleViewOffer}
                  onWithdraw={() => handleStatusUpdate(offer.id, "withdrawn", "declined")}
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
                  onView={handleViewOffer}
                  onWithdraw={() => handleWithdraw(offer.id)}
                />
              ))}
              {logOffers.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No offer history</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Scout Information</h3>
                <p className="text-lg">{selectedOffer.scoutName}</p>
                <p className="text-sm text-muted-foreground">Submitted on {selectedOffer.date}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Collaboration Partners</h3>
                <ul className="list-disc list-inside">
                  {selectedOffer.collaboration.map((partner, index) => (
                    <li key={index} className="text-sm">{partner}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="space-y-2">
                  {selectedOffer.logs?.map((log, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-muted-foreground">{log.timestamp}</span>
                      <p>{log.action} by <FounderProfile founder={log.user.founder} /></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">


            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newOffer.description}
                onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter offer description"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOffer}
              >
                Create Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferCard({
  offer,
  onView,
  onWithdraw,
}: {
  offer: Offer;
  onView: (offer: Offer) => void;
  onWithdraw?: () => void;
}) {
  // Helper function to get status text and user
  const getStatusInfo = () => {
    const lastLog = offer.logs?.[0];
    if (!lastLog?.user?.founder) return null;

    switch (offer.status) {
      case "completed":
        return {
          text: "Accepted by: ",
          user: lastLog.user.founder
        };
      case "declined":
        return {
          text: "Declined by: ",
          user: lastLog.user.founder
        };
      case "withdrawn":
        return {
          text: "Withdrawn by: ",
          user: lastLog.user.founder
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex flex-col p-4 border rounded-lg transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <time className="text-xs text-muted-foreground">{offer.date}</time>
          <p className="text-lg font-medium">{offer.scoutName}</p>
          <p className="text-sm text-muted-foreground">Collaboration: {offer.collaboration.join(", ")}</p>

          {/* Status Information */}
          {offer.status !== "pending" && statusInfo && (
            <p className="text-sm text-muted-foreground mt-1">
              {statusInfo.text}
              <FounderProfile founder={statusInfo.user} />
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="mt-1"
          onClick={(e) => {
            e.stopPropagation();
            onView(offer);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex w-full items-center gap-2 mt-2">
        {offer.status === "pending" && (
          <Button 
            className="w-full bg-muted hover:bg-muted/50" 
            variant="ghost" 
            onClick={onWithdraw}
          >
            Withdraw
          </Button>
        )}

        {offer.status === "completed" && (
          <Button 
            className="w-full px-20 bg-muted text-white" 
            variant="ghost" 
            onClick={onWithdraw}
          >
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
}
