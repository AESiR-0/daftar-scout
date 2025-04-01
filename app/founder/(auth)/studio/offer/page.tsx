"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FounderProfile, FounderProfileProps } from "@/components/FounderProfile";
import { Textarea } from "@/components/ui/textarea";
import { usePitch } from "@/contexts/PitchContext";

interface Offer {
  id: string;
  pitchId: string;
  scoutName: string; // Mapped from investor_id
  collaboration: string; // Mapped from offer_desc
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  date: string; // Mapped from offer_sent_at
  responses?: ActionLog[];
}

interface ActionLog {
  action: "accepted" | "rejected" | "withdrawn" | "Offer Received";
  reason: string;
  timestamp: string;
  user: FounderProfileProps;
}

export default function OffersPage() {
  const { pitchId } = usePitch(); // Get pitchId from context
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { toast } = useToast();
  const [historyFilter, setHistoryFilter] = useState<
    "all" | "accepted" | "rejected" | "withdrawn"
  >("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<"withdraw" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dummy user for action logs (replace with auth user later)
  const currentUser: FounderProfileProps = {
    founder: {
      name: "Alex Johnson",
      age: "25",
      designation: "Founder",
      email: "alex.johnson@example.com",
      phone: "1234567890",
      gender: "Male",
      location: "New York, NY",
      language: ["English"],
    },
  };

  // Fetch offers on mount
  useEffect(() => {
    if (pitchId) {
      fetchOffers();
    }
  }, [pitchId]);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/offers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(pitchId && { "pitch-id": pitchId }),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch offers");
      const data = await response.json();

      // Map API data to Offer interface
      const mappedOffers: Offer[] = data.map((offer: any) => ({
        id: offer.id.toString(),
        pitchId: offer.pitch_id,
        scoutName: offer.investor_id, // Replace with actual investor name if available
        collaboration: offer.offer_desc,
        status: offer.status === "accepted" || offer.status === "rejected" ? offer.status : "pending",
        date: formatDate(offer.offer_sent_at),
        responses: [
          {
            action: "Offer Received",
            reason: "",
            timestamp: formatDate(offer.created_at),
            user: currentUser, // Placeholder; fetch actual user if available
          },
        ],
      }));

      setOffers(mappedOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "Error",
        description: "Failed to load offers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    action: "accepted" | "rejected",
    reason: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId,
          offerId: id,
          action,
          notes: reason,
          actionTakenBy: currentUser.founder.email, // Replace with auth user ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update offer");
      }

      const newResponse: ActionLog = {
        action,
        reason,
        timestamp: formatDate(new Date().toISOString()),
        user: currentUser,
      };

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === id
            ? {
                ...offer,
                status: action,
                responses: [...(offer.responses || []), newResponse],
              }
            : offer
        )
      );

      toast({
        title: `Offer ${action === "accepted" ? "Accepted" : "Declined"}`,
        description: `The offer has been ${action}.`,
        variant: action === "accepted" ? "success" : "destructive",
      });
    } catch (error: any) {
      console.error("Error updating offer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update offer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedOffer(null);
    }
  };

  const handleWithdraw = async (id: string, reason: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints/pitch/founder/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId,
          offerId: id,
          action: "rejected", // Withdraw maps to "rejected" in API
          notes: `Withdrawn: ${reason}`,
          actionTakenBy: currentUser.founder.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to withdraw offer");
      }

      const newResponse: ActionLog = {
        action: "withdrawn",
        reason,
        timestamp: formatDate(new Date().toISOString()),
        user: currentUser,
      };

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === id
            ? {
                ...offer,
                status: "withdrawn",
                responses: [...(offer.responses || []), newResponse],
              }
            : offer
        )
      );

      toast({
        title: "Offer Withdrawn",
        description: "The offer has been successfully withdrawn.",
      });
    } catch (error: any) {
      console.error("Error withdrawing offer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw offer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowActionDialog(false);
      setSelectedOffer(null);
    }
  };

  const pendingOffers = offers.filter((o) => o.status === "pending");
  const logOffers = offers.filter((o) => {
    if (historyFilter === "all") return o.status !== "pending";
    return o.status === historyFilter;
  });

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  return (
    <div className="flex px-5 mt-10 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          <div className="mb-8">
            <div
              className={cn(
                "space-y-3",
                pendingOffers.length > 2 && "overflow-auto max-h-[300px] pr-4"
              )}
            >
              {isLoading && <p className="text-muted-foreground">Loading offers...</p>}
              {!isLoading && pendingOffers.length === 0 && (
                <p className="text-muted-foreground px-4 py-4">No pending offers</p>
              )}
              {!isLoading &&
                pendingOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onView={handleViewOffer}
                    onAccept={(reason) => handleStatusUpdate(offer.id, "accepted", reason)}
                    onDecline={(reason) => handleStatusUpdate(offer.id, "rejected", reason)}
                    onWithdraw={(reason) => handleWithdraw(offer.id, reason)}
                  />
                ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">History</h2>
              <Select
                value={historyFilter}
                onValueChange={(value: "all" | "accepted" | "rejected" | "withdrawn") =>
                  setHistoryFilter(value)
                }
              >
                <SelectTrigger className="w-[180px] bg-muted/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Declined</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border rounded-[0.35rem] bg-[#1a1a1a]">
              <div
                className={cn(
                  "divide-y divide-border",
                  logOffers.length > 3 && "overflow-auto max-h-[400px]"
                )}
              >
                {logOffers.length === 0 && (
                  <p className="text-muted-foreground px-4 py-4">No history</p>
                )}
                {logOffers.map((offer) => (
                  <div key={offer.id} className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="bg-muted/5 rounded-[0.35rem] p-4">
                        <p className="text-sm text-muted-foreground">
                          Offer from {offer.scoutName}: {offer.collaboration}
                        </p>
                        <time className="text-xs text-muted-foreground self-end">
                          {offer.date}
                        </time>
                      </div>
                    </div>

                    {offer.responses && offer.responses.length > 0 && (
                      <div className="mt-6 space-y-4">
                        {offer.responses
                          .filter((response) => response.action !== "Offer Received")
                          .map((response, index) => (
                            <div key={index} className="flex flex-col gap-2">
                              <div className="bg-muted/5 rounded-[0.35rem] p-4 space-y-2">
                                <p className="text-sm text-muted-foreground">{response.reason}</p>
                                <div className="items-center gap-2 text-xs text-muted-foreground">
                                  <span className="capitalize">{response.action} by</span>
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

                    {offer.status === "accepted" && (
                      <div className="flex justify-start mt-4">
                        <Button
                          className="bg-muted hover:bg-muted/50"
                          variant="ghost"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setShowActionDialog(true);
                          }}
                          disabled={isLoading}
                        >
                          Withdraw
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
                <h3 className="font-semibold">Offer Description</h3>
                <p className="text-sm">{selectedOffer.collaboration}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Responses</h3>
                {selectedOffer.responses?.map((response, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-muted-foreground">{response.timestamp}</span>
                    <p>
                      {response.action} by <FounderProfile founder={response.user.founder} />
                    </p>
                    {response.reason && <p className="text-muted-foreground">{response.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ActionDialog
        open={showActionDialog}
        onOpenChange={setShowActionDialog}
        title="Withdraw Offer"
        action="withdraw"
        onConfirm={(reason) => {
          if (selectedOffer) {
            handleWithdraw(selectedOffer.id, reason);
          }
        }}
      />
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
  onAccept: (reason: string) => void;
  onDecline: (reason: string) => void;
  onWithdraw: (reason: string) => void;
}) {
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<"decline" | "withdraw" | null>(null);

  const handleAction = (action: "accept" | "decline" | "withdraw") => {
    if (action === "accept") {
      onAccept(""); // Accept doesn't need a reason
      return;
    }
    setCurrentAction(action);
    setShowActionDialog(true);
  };

  const handleConfirmAction = (reason: string) => {
    switch (currentAction) {
      case "decline":
        onDecline(reason);
        break;
      case "withdraw":
        onWithdraw(reason);
        break;
    }
    setShowActionDialog(false);
    setCurrentAction(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/50 rounded-[0.35rem] p-4">
        <p className="text-sm text-muted-foreground">
          Offer from {offer.scoutName}: {offer.collaboration}
        </p>
        <time className="text-xs text-muted-foreground">{offer.date}</time>
      </div>

      {offer.responses && offer.responses.length > 0 && (
        <div className="space-y-4">
          {offer.responses
            .filter((response) => response.action !== "Offer Received")
            .map((response, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="bg-muted/5 rounded-[0.35rem] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="capitalize">{response.action} by</span>
                    <FounderProfile founder={response.user.founder} />
                  </div>
                  <p className="text-sm text-muted-foreground">{response.reason}</p>
                </div>
                <time className="text-xs text-muted-foreground">{response.timestamp}</time>
              </div>
            ))}
        </div>
      )}

      <div className="flex gap-2">
        {offer.status === "pending" && (
          <>
            <Button
              className="bg-muted hover:bg-muted/50"
              variant="ghost"
              onClick={() => handleAction("accept")}
            >
              Accept
            </Button>
            <Button
              className="bg-muted hover:bg-muted/50"
              variant="ghost"
              onClick={() => handleAction("decline")}
            >
              Decline
            </Button>
          </>
        )}
        {offer.status === "accepted" && (
          <Button
            className="bg-muted hover:bg-muted/50"
            variant="ghost"
            onClick={() => handleAction("withdraw")}
          >
            Withdraw
          </Button>
        )}
        <Button
          className="bg-muted hover:bg-muted/50"
          variant="ghost"
          onClick={() => onView(offer)}
        >
          View Details
        </Button>
      </div>

      {currentAction && (
        <ActionDialog
          open={showActionDialog}
          onOpenChange={setShowActionDialog}
          title={`${currentAction.charAt(0).toUpperCase()}${currentAction.slice(1)} Offer`}
          action={currentAction}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}

function ActionDialog({
  open,
  onOpenChange,
  title,
  action,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  action: "decline" | "withdraw";
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            placeholder="Please provide a reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={() => {
              onConfirm(reason);
              setReason("");
            }}
            className="w-full bg-muted hover:bg-muted/50"
            disabled={!reason.trim()}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}