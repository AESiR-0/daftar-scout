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
import { ScrollArea } from "@/components/ui/scroll-area";

// Offer interface
interface Offer {
  id: string;
  scoutName: string;
  collaboration: string[];
  status: "pending" | "completed" | "declined" | "withdrawn";
  type: "sent" | "accepted" | "withdrawn";
  date: string;
  responses?: ActionLog[];
}

interface ActionLog {
  action: "accepted" | "declined" | "withdrawn" | "Offer Sent";
  reason: string;
  timestamp: string;
  user: {
    founder: {
      name: string;
      age: string;
      designation: string;
      email: string;
      phone: string;
      gender: string;
      location: string;
      language: string[];
      imageUrl?: string;
    };
  };
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
    type: "sent",
    date: formatDate(new Date().toISOString()),
    responses: [
      {
        action: "Offer Sent",
        reason: "Initial proposal",
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
    status: "completed",
    type: "accepted",
    date: formatDate(new Date().toISOString()),
    responses: [
      {
        action: "accepted",
        reason: "Accepted proposal",
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
    responses: [
      {
        action: "declined",
        reason: "Declined proposal",
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
  const [historyFilter, setHistoryFilter] = useState<"all" | "pending" | "completed" | "declined" | "withdrawn">("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    scoutName: "",
    collaboration: "",
    description: ""
  });
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [offerMessage, setOfferMessage] = useState("");

  // Add this check for pending offers
  const hasPendingOffer = offers.some(o => o.status === "pending");

  const handleStatusUpdate = (id: string, type: "accepted" | "withdrawn", status: "completed" | "declined") => {
    setOffers(prev =>
      prev.map(offer => {
        if (offer.id === id) {
          const newLog: ActionLog = {
            action: status === "completed" ? "accepted" : "declined",
            reason: status === "completed" ? "Offer accepted" : "Offer declined",
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
            responses: [newLog, ...(offer.responses || [])]
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
          const newLog: ActionLog = {
            action: "withdrawn",
            reason: "Offer withdrawn",
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
            responses: [newLog, ...(offer.responses || [])]
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
      type: "sent",
      date: formatDate(new Date().toISOString()),
      responses: [
        {
          action: "Offer Sent",
          reason: newOffer.description,
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
      title: "Offer Sent",
      description: "Your offer has been sent to the founder.",
    });
  };

  const pendingOffers = offers.filter(o => o.status === "pending");
  const logOffers = offers.filter(o => {
    if (historyFilter === "all") return true;
    if (historyFilter === "pending") return o.status === "pending";
    if (historyFilter === "withdrawn") return o.type === "withdrawn";
    return o.status === historyFilter;
  });

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  const handleDeclineOffer = (message: string) => {
    setShowActionDialog(true);
    setOfferMessage(message);
  };

  const handleSendOffer = (message: string) => {
    const newOffer: Offer = {
      id: Date.now().toString(),
      scoutName: "Your Scout Name",
      collaboration: ["Your Collaboration Partners"],
      status: "pending",
      type: "sent",
      date: formatDate(new Date().toISOString()),
      responses: [
        {
          action: "Offer Sent",
          reason: message,
          timestamp: formatDate(new Date().toISOString()),
          user: {
            founder: {
              name: "Your Name",
              age: "25",
              designation: "Scout",
              email: "scout@example.com",
              phone: "1234567890",
              gender: "Male",
              location: "Location",
              language: ["English"],
            }
          }
        }
      ]
    };

    setOffers(prev => [newOffer, ...prev]);
    setOfferMessage("");
    toast({
      title: "Offer Sent",
      description: "Your offer has been sent to the founder.",
    });
  };

  return (
    <div className="flex p-0 mt-10 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          {/* New Offer Input */}
          <div className="">
            <Textarea
              placeholder="Write your offer message here..."
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              className="min-h-[100px] bg-muted/50 p-4 border text-white rounded-[0.35rem]"
            />
            <div className="mt-4 flex gap-2 justify-start">
              <Button
                onClick={() => handleSendOffer(offerMessage)}
                disabled={!offerMessage.trim()}
                variant="outline"
                className="rounded-[0.35rem]"
              >
                Send
              </Button>

              <Button variant="outline" 
                onClick={() => handleDeclineOffer(offerMessage)}
                disabled={!offerMessage.trim()}
                className="rounded-[0.35rem]"
              >
                Decline
              </Button>
            </div>
          </div>

          {/* Offer History */}
          <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">History</h2>
                <Select
                  value={historyFilter}
                  onValueChange={(value: "all" | "pending" | "completed" | "declined" | "withdrawn") => setHistoryFilter(value)}
                >
                  <SelectTrigger className="w-[180px] bg-muted/50">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <Card className="border rounded-[0.35rem] bg-[#1a1a1a]">
              <ScrollArea className="w-full h-[400px]">
                <div className={cn(
                  "divide-y divide-border",
                  offers.length > 3 && "overflow-auto max-h-[400px]"
                )}>
                {offers.map((offer) => (
                  <div key={offer.id} className="p-4">
                    {/* Scout Message */}
                    <div className="flex flex-col gap-2">
                      <div className="bg-muted/5 rounded-[0.35rem] p-4">
                        <p className="text-sm text-muted-foreground">
                          {offer.responses?.[0].reason}
                        </p>
                        <time className="text-xs text-muted-foreground self-end">
                          {offer.date}
                        </time>
                      </div>
                    </div>

                    {/* Team Responses */}
                    {offer.responses && offer.responses.length > 1 && (
                      <div className="mt-6 space-y-4">
                        {offer.responses
                          .filter(response => response.action !== "Offer Sent")
                          .map((response, index) => (
                            <div key={index} className="flex flex-col gap-2">
                              <div className="bg-muted/5 rounded-[0.35rem] p-4 space-y-2">
                                <p className="text-sm text-muted-foreground">{response.reason}</p>
                                <div className="items-center gap-2 text-xs text-muted-foreground">
                                  <span className="capitalize">{response.action} by</span><br/>
                                  <FounderProfile founder={response.user.founder} />
                                </div>
                                <time className="text-xs text-muted-foreground self-end">
                                  {response.timestamp}
                                </time>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {offer.status === "pending" ? (
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline"
                          className="rounded-[0.35rem]"
                          onClick={() => handleWithdraw(offer.id)}
                        >
                          Withdraw
                        </Button>
                        
                      </div>
                    ) : (
                      <div className="flex justify-start mt-4">
                        <Button 
                          variant="outline"
                          className="rounded-[0.35rem]"
                          onClick={() => handleWithdraw(offer.id)}
                        >
                          Withdraw
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {offers.length === 0 && (
                  <p className="text-muted-foreground px-4 py-4">No history</p>
                )}
              </div>
              </ScrollArea>
            </Card>
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
                  {selectedOffer.responses?.map((log, index) => (
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
    const lastLog = offer.responses?.[0];
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
