"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, CheckSquare2, XSquare } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import formatDate from "@/lib/formatDate";
import { FounderProfile } from "@/components/FounderProfile";

// Sample approval data (Team Logs)
const approvalRequests = [
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

    return (
        <div className="px-3 container mx-auto py-6 space-y-6 flex gap-8">
            {/* Left Section: Pitch & Questions */}
            <div className="w-2/3 space-y-6">
                <ScrollArea className="space-y-6">
                    {/* Specific Asks Section */}
                    <div className="space-y-2">
                        <Label>Got any specific asks for Investor?</Label>
                        <Textarea
                            value={specificAsks}
                            onChange={(e) => setSpecificAsks(e.target.value)}
                            className="min-h-[100px] resize-none  rounded-md"
                        />
                    </div>


                </ScrollArea>
            </div>

            {/* Right Section: Team Logs (Approvals) */}
            <div className="w-1/3 border-l pl-6 space-y-6">
                <h2 className="text-lg font-medium">Team Approvals</h2>

                <ScrollArea className="h-[calc(100vh-8rem)] space-y-3">
                    {approvalRequests.map((request) => (
                        <div
                            key={request.id}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-muted transition-all"
                        >
                            <div className="space-y-1">
                                <FounderProfile founder={request.profile} />

                                <p className="text-xs text-muted-foreground">
                                    {request.date}
                                </p>
                            </div>

                            {request.status === "approved" ? (
                                <CheckSquare2 className="h-5 w-5 " />
                            ) : (
                                <XSquare className="h-5 w-5 " />
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>
    );
}
