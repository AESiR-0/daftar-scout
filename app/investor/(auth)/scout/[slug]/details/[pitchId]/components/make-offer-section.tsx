"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FounderProfile } from "@/components/FounderProfile";
import formatDate from "@/lib/formatDate";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function MakeOfferSection({
  scoutId,
  pitchId,
  investorId,
}: {
  scoutId: string;
  pitchId: string;
  investorId: string | null;
}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { toast } = useToast();
  const [historyFilter, setHistoryFilter] = useState<
    "all" | "pending" | "completed" | "declined" | "withdrawn"
  >("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    scoutName: "",
    collaboration: "",
    description: "",
  });
  const [offerMessage, setOfferMessage] = useState("");

  // Fetch offers on mount
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(
          `/api/endpoints/pitch/investor/offer?scoutId=${scoutId}&pitchId=${pitchId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch offers");
        }
        const data = await response.json();
        // Map API response to Offer interface
        const mappedOffers: Offer[] = data.map((offer: any) => ({
          id: offer.id.toString(),
          scoutName: "Scout Name", // Replace with actual scout name if available from API
          collaboration: ["Collaboration Partner"], // Replace with actual data if available
          status:
            offer.offerStatus === "accepted" ? "completed" : offer.offerStatus,
          type:
            offer.offerStatus === "accepted"
              ? "accepted"
              : offer.offerStatus === "withdrawn"
              ? "withdrawn"
              : "sent",
          date: formatDate(offer.offeredAt),
          responses: [
            {
              action:
                offer.offerStatus === "pending"
                  ? "Offer Sent"
                  : offer.offerStatus,
              reason: offer.offerDescription,
              timestamp: formatDate(offer.offeredAt),
              user: {
                founder: {
                  name: "Investor Name", // Replace with actual investor name if available
                  age: "30",
                  designation: "Investor",
                  email: "investor@example.com",
                  phone: "1234567890",
                  gender: "Unknown",
                  location: "Unknown",
                  language: ["English"],
                },
              },
            },
          ],
        }));
        setOffers(mappedOffers);
      } catch (error) {
        console.error("Error fetching offers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch offers",
          variant: "destructive",
        });
      }
    };
    fetchOffers();
  }, [scoutId, pitchId, toast]);

  // Check for pending offers
  const hasPendingOffer = offers.some((o) => o.status === "pending");

  const handleCreateOffer = async () => {
    if (hasPendingOffer) {
      toast({
        title: "Cannot Create Offer",
        description:
          "You already have a pending offer. Please withdraw it before creating a new one.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/endpoints/pitch/investor/offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scoutId,
          pitchId,
          investorId,
          offerDescription: offerMessage,
          offerStatus: "pending",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create offer");
      }

      const { offer } = await response.json();
      const newOfferData: Offer = {
        id: offer.id.toString(),
        scoutName: newOffer.scoutName || "Scout Name",
        collaboration: newOffer.collaboration
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean) || ["Collaboration Partner"],
        status: "pending",
        type: "sent",
        date: formatDate(offer.offeredAt),
        responses: [
          {
            action: "Offer Sent",
            reason: newOffer.description,
            timestamp: formatDate(offer.offeredAt),
            user: {
              founder: {
                name: "Investor Name",
                age: "30",
                designation: "Investor",
                email: "investor@example.com",
                phone: "1234567890",
                gender: "Unknown",
                location: "Unknown",
                language: ["English"],
              },
            },
          },
        ],
      };

      setOffers((prev) => [newOfferData, ...prev]);
      setShowCreateModal(false);
      setNewOffer({ scoutName: "", collaboration: "", description: "" });

      toast({
        title: "Offer Sent",
        description: "Your offer has been sent to the founder.",
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive",
      });
    }
  };

  const handleAction = async (
    offerId: string,
    action: "accepted" | "declined" | "withdrawn",
    notes?: string
  ) => {
    try {
      const response = await fetch(
        "/api/endpoints/pitch/investor/offer/action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scoutId,
            pitchId,
            investorId,
            offerId,  
            action,
            notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} offer`);
      }

      setOffers((prev) =>
        prev.map((offer) => {
          if (offer.id === offerId) {
            const newStatus =
              action === "accepted"
                ? "completed"
                : action === "declined"
                ? "declined"
                : "withdrawn";
            const newType =
              action === "accepted"
                ? "accepted"
                : action === "withdrawn"
                ? "withdrawn"
                : "sent";
            const newLog: ActionLog = {
              action,
              reason:
                notes ||
                `${action.charAt(0).toUpperCase() + action.slice(1)} offer`,
              timestamp: formatDate(new Date().toISOString()),
              user: {
                founder: {
                  name: "Investor Name",
                  age: "30",
                  designation: "Investor",
                  email: "investor@example.com",
                  phone: "1234567890",
                  gender: "Unknown",
                  location: "Unknown",
                  language: ["English"],
                },
              },
            };
            return {
              ...offer,
              status: newStatus,
              type: newType,
              responses: [newLog, ...(offer.responses || [])],
            };
          }
          return offer;
        })
      );

      toast({
        title: `Offer ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        description: `The offer has been ${action}.`,
        variant: action === "accepted" ? "success" : "destructive",
      });
    } catch (error) {
      console.error(`Error ${action} offer:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} offer`,
        variant: "destructive",
      });
    }
  };

  const handleRejectPitch = async () => {
    try {
      const response = await fetch(
        "/api/endpoints/pitch/investor/offer/reject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scoutId,
            pitchId,
            investorId,
            reason: offerMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject pitch");
      }

      setOfferMessage("");
      toast({
        title: "Pitch Declined",
        description: "The pitch has been declined.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error rejecting pitch:", error);
      toast({
        title: "Error",
        description: "Failed to reject pitch",
        variant: "destructive",
      });
    }
  };

  const handleSendOffer = async () => {
    await handleCreateOffer();
  };

  const handleDeclineOffer = async () => {
    if (selectedOffer) {
      await handleAction(selectedOffer.id, "declined", offerMessage);
      setSelectedOffer(null);
    }
  };

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  const logOffers = offers.filter((o) => {
    if (historyFilter === "all") return true;
    if (historyFilter === "pending") return o.status === "pending";
    if (historyFilter === "withdrawn") return o.type === "withdrawn";
    return o.status === historyFilter;
  });

  return (
    <div className="flex p-0 mt-10 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          {/* New Offer Input */}
          <div>
            <Textarea
              placeholder="Write your offer message here..."
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              className="min-h-[100px] bg-muted/50 p-4 border text-white rounded-[0.35rem]"
            />
            <div className="mt-4 flex gap-2 justify-start">
              <Button
                onClick={handleSendOffer}
                disabled={!offerMessage.trim()}
                variant="outline"
                className="rounded-[0.35rem] bg-blue-500"
              >
                Send Offer
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectPitch}
                disabled={!offerMessage.trim()}
                className="rounded-[0.35rem]"
              >
                Reject Pitch
              </Button>
            </div>
          </div>

          {/* Offer History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">History</h2>
              <Select
                value={historyFilter}
                onValueChange={(
                  value:
                    | "all"
                    | "pending"
                    | "completed"
                    | "declined"
                    | "withdrawn"
                ) => setHistoryFilter(value)}
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
                <div
                  className={cn(
                    "divide-y divide-border",
                    offers.length > 3 && "overflow-auto max-h-[400px]"
                  )}
                >
                  {logOffers.map((offer) => (
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
                            .filter(
                              (response) => response.action !== "Offer Sent"
                            )
                            .map((response, index) => (
                              <div key={index} className="flex flex-col gap-2">
                                <div className="bg-muted/5 rounded-[0.35rem] p-4 space-y-2">
                                  <p className="text-sm text-muted-foreground">
                                    {response.reason}
                                  </p>
                                  <div className="items-center gap-2 text-xs text-muted-foreground">
                                    <span className="capitalize">
                                      {response.action} by
                                    </span>
                                    <br />
                                    <FounderProfile
                                      founder={response.user.founder}
                                    />
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
                      {offer.status === "pending" && (
                        <div className="flex gap-2 mt-4">
                          {/* <Button
                            variant="outline"
                            className="rounded-[0.35rem]"
                            onClick={() => handleAction(offer.id, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            className="rounded-[0.35rem]"
                            onClick={() => handleAction(offer.id, "declined")}
                          >
                            Decline
                          </Button> */}
                          <Button
                            variant="outline"
                            className="rounded-[0.35rem]"
                            onClick={() => handleAction(offer.id, "withdrawn")}
                          >
                            Withdraw
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {logOffers.length === 0 && (
                    <p className="text-muted-foreground px-4 py-4">
                      No history
                    </p>
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
                <p className="text-sm text-muted-foreground">
                  Submitted on {selectedOffer.date}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Collaboration Partners</h3>
                <ul className="list-disc list-inside">
                  {selectedOffer.collaboration.map((partner, index) => (
                    <li key={index} className="text-sm">
                      {partner}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="space-y-2">
                  {selectedOffer.responses?.map((log, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-muted-foreground">
                        {log.timestamp}
                      </span>
                      <p>
                        {log.action} by{" "}
                        <FounderProfile founder={log.user.founder} />
                      </p>
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
              <Label htmlFor="scoutName">Scout Name</Label>
              <Input
                id="scoutName"
                value={newOffer.scoutName}
                onChange={(e) =>
                  setNewOffer((prev) => ({
                    ...prev,
                    scoutName: e.target.value,
                  }))
                }
                placeholder="Enter scout name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collaboration">Collaboration Partners</Label>
              <Input
                id="collaboration"
                value={newOffer.collaboration}
                onChange={(e) =>
                  setNewOffer((prev) => ({
                    ...prev,
                    collaboration: e.target.value,
                  }))
                }
                placeholder="Enter collaboration partners (comma-separated)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newOffer.description}
                onChange={(e) =>
                  setNewOffer((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter offer description"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOffer}>Create Offer</Button>
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
}: {
  offer: Offer;
  onView: (offer: Offer) => void;
}) {
  const getStatusInfo = () => {
    const lastLog = offer.responses?.[0];
    if (!lastLog?.user?.founder) return null;

    switch (offer.status) {
      case "completed":
        return {
          text: "Accepted by: ",
          user: lastLog.user.founder,
        };
      case "declined":
        return {
          text: "Declined by: ",
          user: lastLog.user.founder,
        };
      case "withdrawn":
        return {
          text: "Withdrawn by: ",
          user: lastLog.user.founder,
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
          <p className="text-sm text-muted-foreground">
            Collaboration: {offer.collaboration.join(", ")}
          </p>

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
    </div>
  );
}
