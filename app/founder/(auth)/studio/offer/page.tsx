"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import formatDate from "@/lib/formatDate";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FounderProfile, FounderProfileProps } from "@/components/FounderProfile";
import { Textarea } from "@/components/ui/textarea";

// Offer interface
interface Offer {
  id: string;
  scoutName: string;
  collaboration: string[];
  acceptedBy?: string;
  status: "pending" | "completed" | "declined" | "withdrawn";
  type: "received" | "accepted" | "withdrawn";
  date: string;
  responses?: ActionLog[];
}

// First, add a new interface for action logs
interface ActionLog {
  action: "accepted" | "declined" | "withdrawn" | "Offer Received"
  reason: string
  timestamp: string
  user: FounderProfileProps
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
    responses: [
      {
        action: "Offer Received",
        reason: "",
        timestamp: formatDate(new Date().toISOString()),
        user: {
          founder: {
            name: getRandomUser(),
            age: "25",
            designation: "CTO",
            email: "john.doe@example.com",
            phone: "1234567890",
            gender: "Male",
            location: "New York, NY",
            language: ["English", "Spanish"],
            imageUrl: "https://example.com/john-doe.jpg"
          }
        },
      },
    ],
  },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(dummyOffers);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { toast } = useToast();
  const [historyFilter, setHistoryFilter] = useState<"all" | "completed" | "declined" | "withdrawn">("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<"withdraw" | null>(null);

  const handleStatusUpdate = (id: string, type: "accepted" | "withdrawn", status: "completed" | "declined", reason: string) => {
    setOffers(prev =>
      prev.map(offer => {
        if (offer.id === id) {
          const newResponse: ActionLog = {
            action: status === "completed" ? "accepted" : "declined",
            reason,
            timestamp: formatDate(new Date().toISOString()),
            user: {
              founder: {
                name: getRandomUser(),
                age: "25",
                email: "john.doe@example.com",
                phone: "1234567890",
                gender: "Male",
                designation: "Founder",
                location: "New York, NY",
                language: ["English", "Spanish"],
              }
            }
          }
          return {
            ...offer,
            status,
            type,
            acceptedBy: status === "completed" ? getRandomUser() : undefined,
            responses: [...(offer.responses || []), newResponse]
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

  const handleWithdraw = (id: string, reason: string) => {
    setOffers(prev =>
      prev.map(offer => {
        if (offer.id === id && offer.status === "completed") {
          const newResponse: ActionLog = {
            action: "withdrawn",
            reason,
            timestamp: formatDate(new Date().toISOString()),
            user: {
              founder: {
                name: getRandomUser(),
                age: "25",
                email: "john.doe@example.com",
                phone: "1234567890",
                gender: "Male",
                location: "New York, NY",
                designation: "CEO",
                language: ["English", "Spanish"],
                imageUrl: "https://example.com/john-doe.jpg"
              }
            }
          }
          return {
            ...offer,
            status: "withdrawn",
            type: "withdrawn",
            acceptedBy: undefined,
            responses: [...(offer.responses || []), newResponse]
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

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  return (
    <div className="flex px-5 mt-10 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          <div className="mb-8">
            <div className={cn(
              "space-y-3",
              pendingOffers.length > 2 && "overflow-auto max-h-[300px] pr-4"
            )}>
              {pendingOffers.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onView={handleViewOffer}
                  onAccept={(reason: string) => handleStatusUpdate(offer.id, "accepted", "completed", reason)}
                  onDecline={(reason: string) => handleStatusUpdate(offer.id, "withdrawn", "declined", reason)}
                  onWithdraw={(reason: string) => handleWithdraw(offer.id, reason)}
                />
              ))}
              {pendingOffers.length === 0 && (
                <p className="text-muted-foreground px-4 py-4">No offers</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">History</h2>
              <Select
                value={historyFilter}
                onValueChange={(value: "all" | "completed" | "declined" | "withdrawn") => setHistoryFilter(value)}
              >
                <SelectTrigger className="w-[180px] bg-muted/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Categories</SelectItem>
                  <SelectItem value="completed">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border rounded-[0.35rem] bg-[#1a1a1a]">
              <div className={cn(
                "divide-y divide-border",
                logOffers.length > 3 && "overflow-auto max-h-[400px]"
              )}>
                {logOffers.map(offer => (
                  <div key={offer.id} className="p-4">
                    {/* Scout Message */}
                    <div className="flex flex-col gap-2">
                      <div className="bg-muted/5 rounded-[0.35rem] p-4">
                        <p className="text-sm text-muted-foreground">
                          Thank you for applying to {offer.scoutName}. We are excited to have you on board. 
                          {offer.collaboration} takes a step forward to make this happen.
                        </p>
                        <time className="text-xs text-muted-foreground self-end">
                        {offer.date}
                      </time>
                      </div>
                      
                    </div>

                    {/* Team Responses */}
                    {offer.responses && offer.responses.length > 0 && (
                      <div className="mt-6 space-y-4">
                        {offer.responses
                          .filter(response => response.action !== "Offer Received")
                          .map((response, index) => (
                            <div key={index} className="flex flex-col gap-2">
                              <div className="bg-muted/5 rounded-[0.35rem] p-4 space-y-2">
                                <p className="text-sm text-muted-foreground">{response.reason}</p>
                                <div className=" items-center gap-2 text-xs text-muted-foreground">
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
                    {offer.status === "completed" && (
                      <div className="flex justify-start mt-4">
                        <Button 
                          className="bg-muted hover:bg-muted/50" 
                          variant="ghost" 
                          onClick={() => {
                            setSelectedOffer(offer);
                            setShowActionDialog(true);
                          }}
                        >
                          Withdraw
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {logOffers.length === 0 && (
                  <p className="text-muted-foreground px-4 py-4">No history</p>
                )}
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
                <h3 className="font-semibold">Collaboration Partners</h3>
                <ul className="list-disc list-inside">
                  {selectedOffer.collaboration.map((partner, index) => (
                    <li key={index} className="text-sm">{partner}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="space-y-2">
                  {selectedOffer.responses?.map((response, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-muted-foreground">{response.timestamp}</span>
                      <p>{response.action} by <FounderProfile founder={response.user.founder} /></p>
                    </div>
                  ))}
                </div>
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
            setShowActionDialog(false);
            setSelectedOffer(null);
          }
        }}
      />
    </div>
  );
}

function OfferCard({ offer, onView, onAccept, onDecline, onWithdraw }: { offer: Offer, onView: (offer: Offer) => void, onAccept: (reason: string) => void, onDecline: (reason: string) => void, onWithdraw: (reason: string) => void }) {
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [currentAction, setCurrentAction] = useState<"decline" | "withdraw" | null>(null)

  const handleAction = (action: "accept" | "decline" | "withdraw") => {
    if (action === "accept") {
      onAccept(""); // Accept doesn't need a reason
      return;
    }
    setCurrentAction(action)
    setShowActionDialog(true)
  }

  const handleConfirmAction = (reason: string) => {
    switch (currentAction) {
      case "decline":
        onDecline(reason)
        break
      case "withdraw":
        onWithdraw(reason)
        break
    }
    setShowActionDialog(false)
    setCurrentAction(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Scout Message */}
      <div className="bg-muted/5 rounded-[0.35rem] p-4">
        <p className="text-sm text-muted-foreground">
          Thank you for applying to {offer.scoutName}. We are excited to have you on board. 
          {offer.collaboration} takes a step forward to make this happen.
        </p>
        <time className="text-xs text-muted-foreground">
          {offer.date}
        </time>
      </div>

      {/* Team Responses */}
      {offer.responses && offer.responses.length > 0 && (
        <div className="space-y-4">
          {offer.responses
            .filter(response => response.action !== "Offer Received")
            .map((response, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="bg-muted/5 rounded-[0.35rem] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="capitalize">{response.action} by</span>
                    <FounderProfile founder={response.user.founder} />
                  </div>
                  <p className="text-sm text-muted-foreground">{response.reason}</p>
                </div>
                <time className="text-xs text-muted-foreground">
                  {response.timestamp}
                </time>
              </div>
            ))}
        </div>
      )}

      {/* Action Buttons */}
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

        {offer.status === "completed" && (
          <Button 
            className="bg-muted hover:bg-muted/50" 
            variant="ghost" 
            onClick={() => handleAction("withdraw")}
          >
            Withdraw
          </Button>
        )}
      </div>

      {/* Action Dialog - Only for decline and withdraw */}
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
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  action: "accept" | "decline" | "withdraw"
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState("")

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
              onConfirm(reason)
              setReason("")
            }}
            className="w-full bg-muted hover:bg-muted/50"
            disabled={!reason.trim()}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
