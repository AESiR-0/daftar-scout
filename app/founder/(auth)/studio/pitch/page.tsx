"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Check, CheckSquare2, X, Clock, MinusCircle, XSquare } from "lucide-react";
import { FounderProfile } from "@/components/FounderProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentDialog } from "@/components/dialogs/payment-dialog";
import  formatDate  from "@/lib/formatDate"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox"

interface ApprovalRequest {
    id: string;
    username: string;
    designation: string;
    date: string;
    status: "approved" | "pending";
    profile: {
        name: string;
        age: string;
        gender: string;
        email: string;
        phone: string;
        location: string;
        language: string[];
        designation: string;
    };
}

const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <X className="h-5 w-5 text-destructive" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <MinusCircle className="h-5 w-5 text-muted-foreground" />
    }
  }
  
// Sample approval data (Team Logs)
const initialApprovalRequests: ApprovalRequest[] = [
    {
        id: "1",
        username: "John Smith",
        designation: "Co-Founder & CTO",
        date: formatDate("2024-03-20T14:30:00"),
        status: "approved",
        profile: {
            name: "John Smith",
            age: "30",
            gender: "Male",
            email: "john.smith@example.com",
            phone: "1234567890",
            location: "New York, NY",
            language: ["English", "Tamil"],
            designation: "Co-Founder & CTO",
        },
    },
    {
        id: "2",
        username: "Sarah Johnson",
        designation: "Product Lead",
        date: formatDate("2024-03-19T10:15:00"),
        status: "pending",
        profile: {
            name: "Sarah Johnson",
            age: "28",
            gender: "Female",
            email: "sarah.johnson@example.com",
            designation: "Product Lead",
            phone: "0987654321",
            language: ["English", "Spanish"],
            location: "San Francisco, CA",
        },
    },
    {
        id: "3",
        username: "Michael Chen",
        designation: "Technical Advisor",
        date: formatDate("2024-03-18T16:45:00"),
        status: "approved",
        profile: {
            name: "Michael Chen",
            age: "35",
            gender: "Male",
            email: "michael.chen@example.com",
            phone: "0987654321",
            designation: "Technical Advisor",
            language: ["English", "Chinese"],
            location: "San Francisco, CA",
        },
    },
];

export default function PitchPage() {
    const pathname = usePathname();
    const [specificAsks, setSpecificAsks] = useState("");
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(initialApprovalRequests);
    const [termsAccepted, setTermsAccepted] = useState(false)
    

    // Add approval counts calculation
    const totalMembers = approvalRequests.length;
    const approvedCount = approvalRequests.filter(req => req.status === "approved").length;

    // Add state for current user (for demo, let's use John Smith as current user)
    const [currentUserId] = useState("1");

    // Add function to handle approval toggle
    const handleApprovalToggle = (requestId: string) => {
        if (requestId !== currentUserId) return;
        
        setApprovalRequests(prev => prev.map(req => {
            if (req.id === requestId) {
                return {
                    ...req,
                    status: req.status === "approved" ? "pending" : "approved",
                    date: formatDate(new Date().toISOString())
                };
            }
            return req;
        }));
    };

    return (
        <div className="px-10 container mx-auto py-5 space-y-6 flex gap-8">
            {/* Left Section: Pitch & Questions */}
            <div className="w-2/3 space-y-6">
                <ScrollArea className="space-y-6">
                    {/* Specific Asks Section */}
                    <div className="space-y-2">
                        <Label>Got any specific asks for Investor?</Label>
                        <Textarea
                            value={specificAsks}
                            onChange={(e) => setSpecificAsks(e.target.value)}
                            className="min-h-[100px] bg-muted/50 resize-none rounded-xl"
                        />
                    </div>

                    {/* Team Approvals Section */}
                    <div className="flex items-center mt-4 space-x-2 mb-4">
                        <Checkbox 
                            id="terms" 
                            checked={termsAccepted}
                            className="h-5 w-5 mt-0.5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        />
                        <label
                            htmlFor="terms"
                            className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I confirm that this pitch is ready for team approval and submission
                        </label>
                    </div>

                    <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Team&apos;s Approval Required</h3>
                <div className="text-sm text-muted-foreground">
                  {approvalRequests.filter(a => a.status === 'approved').length} of {approvalRequests.length}
                </div>
              </div>

              <div>
                {approvalRequests.map((member) => {
                  const approval = approvalRequests.find(a => a.id === member.id) || {
                    status: 'not_requested',
                    date: undefined
                  }

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{member.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(approval.status)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
                </ScrollArea>
            </div>

            {/* Right Section: Action & Errors */}
            <div className="w-1/3 pl-6 space-y-6">
                <Button 
                    className="w-full rounded-[0.35rem] bg-muted hover:bg-muted/50"
                    size="lg"
                    onClick={() => setShowPaymentDialog(true)}
                >
                    Pitch Now
                </Button>

                <Card className="p-4 border bg-muted/10">
                    <h3 className="text-sm font-medium mb-2">Pitch not shared</h3>
                    <p className="text-xs text-muted-foreground">
                        Reason
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Please check your team&apos;s approval and ensure all members have approved the pitch.
                    </p>
                </Card>
            </div>

            <PaymentDialog 
                open={showPaymentDialog} 
                onOpenChange={setShowPaymentDialog}
            />
        </div>
    );
}
