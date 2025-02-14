"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare2, XSquare } from "lucide-react";
import { FounderProfile } from "@/components/FounderProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentDialog } from "@/components/dialogs/payment-dialog";
import  formatDate  from "@/lib/formatDate"

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
                            className="min-h-[100px] resize-none rounded-md"
                        />
                    </div>

                    {/* Team Approvals Section */}
                    <div className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium">Team Approvals</h2>
                            <span className="text-sm text-muted-foreground">
                                {approvedCount} of {totalMembers}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {approvalRequests.map((request: ApprovalRequest) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-all"
                                >
                                    <div className="space-y-1">
                                        <FounderProfile founder={request.profile} />
                                        <p className="text-xs text-muted-foreground">
                                            {request.date}
                                        </p>
                                    </div>
                                    {request.id === currentUserId ? (
                                        <button
                                            onClick={() => handleApprovalToggle(request.id)}
                                            className="hover:opacity-80 transition-opacity"
                                        >
                                            {request.status === "approved" ? (
                                                <CheckSquare2 className="h-5 w-5" />
                                            ) : (
                                                <XSquare className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </button>
                                    ) : (
                                        <div>
                                            {request.status === "approved" ? (
                                                <CheckSquare2 className="h-5 w-5" />
                                            ) : (
                                                <XSquare className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Right Section: Action & Errors */}
            <div className="w-1/3 border-l pl-6 space-y-6">
                <Button 
                    className="w-full bg-muted hover:bg-muted/50"
                    size="lg"
                    onClick={() => setShowPaymentDialog(true)}
                >
                    Pitch Now
                </Button>

                <Card className="p-4 border bg-muted/10">
                    <h3 className="text-sm font-medium mb-2">Please fix this issue:</h3>
                    <p className="text-xs text-muted-foreground">
                        Data mismatch: Please ensure all team members have approved the pitch
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
