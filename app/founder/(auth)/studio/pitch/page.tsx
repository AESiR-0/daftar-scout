"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import formatDate from "@/lib/formatDate";

// Sample approval data (Team Logs)
const approvalRequests = [
    {
        id: "1",
        username: "John Smith",
        designation: "Co-Founder & CTO",
        date: formatDate("2024-03-20T14:30:00"),
        status: "approved",
        profile: {
            email: "john.smith@example.com",
            linkedin: "https://linkedin.com/in/johnsmith",
            experience: "10+ years in Tech Leadership",
        },
    },
    {
        id: "2",
        username: "Sarah Johnson",
        designation: "Product Lead",
        date: formatDate("2024-03-19T10:15:00"),
        status: "pending",
        profile: {
            email: "sarah.johnson@example.com",
            linkedin: "https://linkedin.com/in/sarahjohnson",
            experience: "6+ years in Product Management",
        },
    },
    {
        id: "3",
        username: "Michael Chen",
        designation: "Technical Advisor",
        date: formatDate("2024-03-18T16:45:00"),
        status: "approved",
        profile: {
            email: "michael.chen@example.com",
            linkedin: "https://linkedin.com/in/michaelchen",
            experience: "15+ years in Tech Advising",
        },
    },
];

export default function PitchPage() {
    const pathname = usePathname();
    const [specificAsks, setSpecificAsks] = useState("");

    return (
        <div className="container max-w-6xl mx-auto py-6 space-y-6 flex gap-8">
            {/* Left Section: Pitch & Questions */}
            <div className="w-2/3 space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-xl font-semibold">Pitch</h1>
                    <p className="text-sm text-muted-foreground">
                        What are you looking for from the investor?
                    </p>
                </div>

                <ScrollArea className="space-y-6">
                    {/* Specific Asks Section */}
                    <div className="space-y-2">
                        <Label>Specific Asks for Investor</Label>
                        <Textarea
                            value={specificAsks}
                            onChange={(e) => setSpecificAsks(e.target.value)}
                            placeholder="What specific support or resources are you looking for?"
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
                                <HoverCard>
                                    <HoverCardTrigger className="font-medium cursor-pointer hover:underline">
                                        {request.username}
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-64 p-4 space-y-2">
                                        <h3 className="text-sm font-medium">{request.username}</h3>
                                        <p className="text-xs text-muted-foreground">{request.designation}</p>
                                        <p className="text-xs text-muted-foreground">📧 {request.profile.email}</p>
                                        <p className="text-xs text-muted-foreground">🔗 <a href={request.profile.linkedin} target="_blank" className="text-blue-600 hover:underline">LinkedIn</a></p>
                                        <p className="text-xs text-muted-foreground">💼 {request.profile.experience}</p>
                                    </HoverCardContent>
                                </HoverCard>

                                <p className="text-xs text-muted-foreground">{request.designation}</p>
                                <p className="text-xs text-muted-foreground">
                                    {request.date}
                                </p>
                            </div>

                            {request.status === "approved" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-yellow-500" />
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>
    );
}
