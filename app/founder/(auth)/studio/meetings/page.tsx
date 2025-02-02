"use client"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, Users, FileText, Filter, Search, MapPin, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScheduleMeetingDialog } from "@/components/dialogs/schedule-meeting-dialog"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import formatDate from "@/lib/formatDate"
import { StudioCard } from "../components/layout/studio-card"

interface MeetingDetails {
    agenda: string;
    date: string;
    time: string;
    location: string;
    program: string;
    collaboration: string;
    pitchName: string;
    daftarName: string;
    attendees: string[];
    status: string;
    name: string;
    // Add other meeting properties as needed
}

const pitchDetails = {
    meetings: [
        {
            id: "1",
            name: "Initial Discussion",
            status: "Scheduled",
            date: formatDate("2024-03-20"),
            time: "14:30",
            location: "Virtual Meeting",
            program: "Tech Innovation Fund",
            collaboration: "Daftar OS",
            pitchName: "AI Chatbot",
            daftarName: "Tech Startup",
            attendees: ["John Doe", "Sarah Smith", "Mike Johnson"],
            agenda: "Discuss project scope, timeline, and initial requirements"
        },
        // Add more meetings...
    ],
}

export default function MeetingsPage() {
    const params = useParams()
    const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)
    const [selectedMeetingDetails, setSelectedMeetingDetails] = useState<MeetingDetails | null>(null)
    const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false)
    const mode = params?.mode as string

    // Move useEffect logic into click handler
    const handleMeetingClick = (meetingId: string) => {
        setSelectedMeeting(meetingId)
        const meetingDetails = pitchDetails.meetings.find(
            meeting => meeting.id === meetingId
        )
        setSelectedMeetingDetails(meetingDetails || null)
    }

    return (
        <StudioCard 
            title="Meetings" 
            description="Schedule and manage your meetings with investors."
        >
            <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold">Meeting History</h2>
                            <Badge variant="secondary">
                                {pitchDetails.meetings.length} Meetings
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Meeting History */}
                        <div className="space-y-4">
                            {pitchDetails.meetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className={`p-4 border rounded-[0.3rem] space-y-2 cursor-pointer hover:border-blue-600 transition-colors ${selectedMeeting === meeting.id ? 'border-blue-600' : ''
                                        }`}
                                    onClick={() => handleMeetingClick(meeting.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">{meeting.name}</h4>
                                        <Badge variant="secondary">{meeting.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {`${meeting.date}T${meeting.time}`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Meeting Details */}
                        {selectedMeetingDetails && (
                            <div className="border rounded-[0.3rem] p-4 space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium">{selectedMeetingDetails.name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedMeetingDetails.program}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedMeetingDetails.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {(`${selectedMeetingDetails.date}T${selectedMeetingDetails.time}`).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Collaboration</p>
                                        <p className="text-sm">{selectedMeetingDetails.collaboration}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Pitch</p>
                                        <p className="text-sm">{selectedMeetingDetails.pitchName}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Daftar</p>
                                        <p className="text-sm">{selectedMeetingDetails.daftarName}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Attendees</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedMeetingDetails.attendees.map((attendee) => (
                                                <Badge key={attendee} variant="secondary" className="text-xs">
                                                    {attendee}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Agenda</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedMeetingDetails.agenda}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>

            <ScheduleMeetingDialog
                open={scheduleMeetingOpen}
                onOpenChange={setScheduleMeetingOpen}
            />
        </StudioCard>
    )
} 