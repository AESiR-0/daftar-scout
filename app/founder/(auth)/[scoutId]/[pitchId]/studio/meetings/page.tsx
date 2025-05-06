"use client"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, Users, FileText, Filter, Search, MapPin, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScheduleMeetingDialog } from "@/components/dialogs/schedule-meeting-dialog"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import formatDate from "@/lib/formatDate"
import { StudioCard } from "../components/layout/studio-card"
import { useToast } from "@/hooks/use-toast"

interface MeetingDetails {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    program: string;
    collaboration: string[];
    pitchName: string;
    daftarName: string;
    attendees: string[];
    status: string;
    calendarEventId: string;
    meetLink?: string;
}

export default function MeetingsPage() {
    const params = useParams()
    const [meetings, setMeetings] = useState<MeetingDetails[]>([])
    const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)
    const [selectedMeetingDetails, setSelectedMeetingDetails] = useState<MeetingDetails | null>(null)
    const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchMeetings()
    }, [])

    const fetchMeetings = async () => {
        try {
            const response = await fetch('/api/endpoints/calendar/meetings')
            if (!response.ok) {
                throw new Error('Failed to fetch meetings')
            }
            const data = await response.json()
            setMeetings(data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching meetings:', error)
            toast({
                title: 'Error',
                description: 'Failed to fetch meetings',
                variant: 'destructive',
            })
            setLoading(false)
        }
    }

    const handleMeetingClick = (meetingId: string) => {
        setSelectedMeeting(meetingId)
        const meetingDetails = meetings.find(
            meeting => meeting.id === meetingId
        )
        setSelectedMeetingDetails(meetingDetails || null)
    }

    const handleAcceptMeeting = async (meetingId: string) => {
        try {
            const response = await fetch(`/api/endpoints/calendar/meetings/${meetingId}/accept`, {
                method: 'POST',
            })
            if (!response.ok) {
                throw new Error('Failed to accept meeting')
            }
            
            // Refresh meetings list
            await fetchMeetings()
            
            toast({
                title: 'Success',
                description: 'Meeting accepted successfully',
            })
        } catch (error) {
            console.error('Error accepting meeting:', error)
            toast({
                title: 'Error',
                description: 'Failed to accept meeting',
                variant: 'destructive',
            })
        }
    }

    const handleRejectMeeting = async (meetingId: string) => {
        try {
            const response = await fetch(`/api/endpoints/calendar/meetings/${meetingId}/reject`, {
                method: 'POST',
            })
            if (!response.ok) {
                throw new Error('Failed to reject meeting')
            }
            
            // Refresh meetings list
            await fetchMeetings()
            
            toast({
                title: 'Success',
                description: 'Meeting rejected successfully',
            })
        } catch (error) {
            console.error('Error rejecting meeting:', error)
            toast({
                title: 'Error',
                description: 'Failed to reject meeting',
                variant: 'destructive',
            })
        }
    }

    return (
        <StudioCard>
            <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="space-y-6 mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold">Meeting History</h2>
                            <Badge variant="secondary">
                                {meetings.length} Meetings
                            </Badge>
                        </div>
                        <Button variant="outline" onClick={() => setScheduleMeetingOpen(true)}>
                            <Calendar className="h-4 w-4" />
                            Schedule Meeting
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Meeting History */}
                        <div className="space-y-4">
                            {loading ? (
                                // Loading skeletons
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="p-4 border rounded-[0.35rem] space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
                                            <div className="w-1/4 h-4 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
                                            <div className="w-1/3 h-3 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))
                            ) : meetings.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    No meetings scheduled
                                </div>
                            ) : (
                                meetings.map((meeting) => (
                                    <div
                                        key={meeting.id}
                                        className={`p-4 border rounded-[0.35rem] space-y-2 cursor-pointer transition-colors ${
                                            selectedMeeting === meeting.id ? 'border-gray-600' : ''
                                        }`}
                                        onClick={() => handleMeetingClick(meeting.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-sm">{meeting.title}</h4>
                                            <Badge variant="secondary">{meeting.status}</Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                {new Date(meeting.startTime).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Meeting Details */}
                        {selectedMeetingDetails && (
                            <div className="border rounded-[0.35rem] p-4 space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium">{selectedMeetingDetails.title}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedMeetingDetails.program}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            {selectedMeetingDetails.meetLink ? (
                                                <Video className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span>
                                                {selectedMeetingDetails.meetLink ? (
                                                    <a 
                                                        href={selectedMeetingDetails.meetLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        Join Meeting
                                                    </a>
                                                ) : (
                                                    selectedMeetingDetails.location
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {new Date(selectedMeetingDetails.startTime).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <p className="text-sm text-muted-foreground">Collaboration</p>
                                        <p className="text-sm">{selectedMeetingDetails.collaboration.join(", ")}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <p className="text-sm text-muted-foreground">Pitch</p>
                                        <p className="text-sm">{selectedMeetingDetails.pitchName}</p>
                                    </div>

                                    <div className="flex gap-2">
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
                                            <span className="text-sm font-medium">Description</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedMeetingDetails.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRejectMeeting(selectedMeetingDetails.id)}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="text-white"
                                        onClick={() => handleAcceptMeeting(selectedMeetingDetails.id)}
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
                onScheduled={fetchMeetings}
            />
        </StudioCard>
    )
} 