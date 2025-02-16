"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Check, X, Trash2, Video, MapPin, Folder, Presentation } from "lucide-react"
import { ScheduleMeetingDialog } from "@/components/dialogs/schedule-meeting-dialog"
import { useToast } from "@/hooks/use-toast"
import formatDate from "@/lib/formatDate"
import { cn } from "@/lib/utils"

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  status: "Pending" | "Confirmed"
  attendees: string[]
  description: string
  createdBy: string
  daftar?: string
  pitch?: string
  location: "virtual" | "in-person"
  locationAddress?: string
  agenda: string
}

const meetings: Meeting[] = [
  {
    id: "1",
    title: "Startup Pitch Review",
    date: formatDate(new Date().toISOString()), // Today's date
    time: "10:00 AM",
    status: "Confirmed",
    attendees: ["John Doe", "Sarah Smith", "Tech Innovators Team"],
    description: "Initial pitch review with the founding team",
    createdBy: "John Doe",
    daftar: "Tech Innovators Scout",
    pitch: "AI Healthcare Platform",
    location: "virtual",
    agenda: "1. Company Introduction\n2. Product Demo\n3. Market Analysis\n4. Q&A Session"
  },
  {
    id: "2",
    title: "Due Diligence Meeting",
    date: formatDate((new Date(Date.now() + 86400000).toISOString())), // Tomorrow
    time: "2:00 PM",
    status: "Pending",
    attendees: ["Mike Johnson", "Emily Brown", "FinTech Solutions Team"],
    description: "Detailed review of technical architecture and IP",
    createdBy: "Mike Johnson",
    daftar: "FinTech Scout",
    pitch: "Blockchain Payment Solution",
    location: "in-person",
    locationAddress: "Innovation Hub, Dubai International Financial Centre, Level 3",
    agenda: "1. Technical Architecture Review\n2. IP Portfolio Discussion\n3. Security Measures\n4. Compliance Framework"
  },
  {
    id: "3",
    title: "Investment Committee Review",
    date: formatDate(new Date().toISOString()),
    time: "3:30 PM",
    status: "Confirmed",
    attendees: ["Hassan Ahmed", "Fatima Al-Sayed", "Investment Committee"],
    description: "Final investment committee review for funding decision",
    createdBy: "Hassan Ahmed",
    daftar: "Healthcare Scout",
    pitch: "Digital Health Platform",
    location: "in-person",
    locationAddress: "Investment Office, Downtown Dubai, Floor 15",
    agenda: "1. Investment Thesis\n2. Market Opportunity\n3. Risk Assessment\n4. Terms Discussion"
  }
]


const isToday = (dateString: string) => {
  const today = new Date()
  const date = new Date(dateString)
  return date.toDateString() === today.toDateString()
}

export default function MeetingsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const { toast } = useToast()

  const pendingMeetings = meetings.filter(m => m.status === "Pending")
  const todayMeetings = meetings.filter(m => m.date === formatDate(new Date().toISOString()))

  // Get meetings for selected date
  const selectedDateMeetings = selectedDate
    ? meetings.filter(m => m.date === formatDate(selectedDate.toISOString()))
    : []

  // Get all dates that have meetings
  const meetingDates = meetings.reduce((dates, meeting) => {
    const date = new Date(meeting.date)
    dates[date.toDateString()] = true
    return dates
  }, {} as Record<string, boolean>)

  const currentUser = "John Doe"

  const handleAccept = async (meetingId: string) => {
    try {
      // Simulating API call - replace with actual API call
      // await api.meetings.accept(meetingId)

      // Update local state
      const updatedMeeting = meetings.find(m => m.id === meetingId)
      if (updatedMeeting) {
        updatedMeeting.status = "Confirmed"
        // Add to today's meetings if it's today
        if (isToday(updatedMeeting.date)) {
          todayMeetings.push(updatedMeeting)
        }
      }

      toast({
        title: "Meeting Accepted",
        description: "The meeting has been added to your schedule",
        variant: "success",
      })

      // Optionally close or update UI
      setSelectedMeeting(null)
    } catch (error) {
      toast({
        title: "Error accepting meeting",
        description: (error as Error).message,
        variant: "error",
      })
    }
  }

  const handleReject = (meetingId: string) => {
    console.log("Rejecting meeting:", meetingId)
  }

  const handleDelete = (meetingId: string) => {
    console.log("Deleting meeting:", meetingId)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date && selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(undefined)
    } else {
      setSelectedDate(date)
    }
  }

  return (
    <div className="space-y-6 container mx-auto px-10">
      {/* Header - Removed local search, kept only Schedule button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Meetings</h2>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setScheduleOpen(true)}
        >
          <span className="text-xs">Schedule Meeting</span>
        </Button>
      </div>

      {/* Three Column Layout */}
      <div className="flex gap-6">
        {/* Calendar and Pending Column */}
        <div className="space-y-6">
          <div className="border rounded-[0.35rem]  p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="w-full"
              modifiers={{ meeting: (date) => meetingDates[date.toDateString()] }}
              modifiersClassNames={{
                meeting: "meeting-dot"
              }}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Waiting Confirmation</h3>
            {pendingMeetings.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No pending meetings
              </div>
            ) : (
              pendingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-3 border rounded-[0.35rem]  space-y-2 cursor-pointer hover:border-blue-600"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{meeting.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(meeting.date)} at {meeting.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Date Schedule Column */}
        <div className="w-1/3 border-l px-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                {selectedDate && formatDate(selectedDate.toISOString()) === formatDate(new Date().toISOString())
                  ? "Today's Schedule"
                  : "Schedule"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedDate ? formatDate(selectedDate.toISOString()) : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {selectedDateMeetings.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No meetings scheduled for {selectedDate && formatDate(selectedDate.toISOString()) === formatDate(new Date().toISOString())
                  ? "today"
                  : "this day"}
              </div>
            ) : (
              selectedDateMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={cn(
                    "flex items-center gap-4 p-3 border rounded-[0.35rem]  cursor-pointer hover:border-blue-600",
                    selectedMeeting?.id === meeting.id && "border-blue-600"
                  )}
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <div className="w-20 text-sm font-medium">
                    {meeting.time}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{meeting.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {meeting.attendees.join(", ")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Meeting Details Column */}
        <div className="border-l px-6">
          {selectedMeeting ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">{selectedMeeting.title}</h2>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {selectedMeeting.status}
                      </Badge>
                      {isToday(selectedMeeting.date) && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Today
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(selectedMeeting.date)} at {selectedMeeting.time}</span>
                </div>

                {selectedMeeting.location === "virtual" ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span>Virtual Meeting</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>In-Person Meeting</span>
                    </div>
                    {selectedMeeting.locationAddress && (
                      <div className="pl-6 text-sm text-muted-foreground">
                        {selectedMeeting.locationAddress}
                      </div>
                    )}
                  </div>
                )}

                {selectedMeeting.daftar && (
                  <div className="flex items-center gap-2 text-sm">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span>Daftar: {selectedMeeting.daftar}</span>
                  </div>
                )}

                {selectedMeeting.pitch && (
                  <div className="flex items-center gap-2 text-sm">
                    <Presentation className="h-4 w-4 text-muted-foreground" />
                    <span>Pitch: {selectedMeeting.pitch}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Attendees :</span>
                  </div>
                  <div className="pl-6">
                    {selectedMeeting.attendees.map((attendee) => (
                      <div key={attendee} className="text-sm">
                        {attendee}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Agenda</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedMeeting.agenda}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-[0.35rem] "
                    onClick={() => handleAccept(selectedMeeting.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 rounded-[0.35rem]  text-white"
                    onClick={() => handleReject(selectedMeeting.id)}
                  >
                    Reject
                  </Button>
                  {selectedMeeting.createdBy === currentUser && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(selectedMeeting.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Select a meeting to view details
            </div>
          )}
        </div>
      </div>

      <ScheduleMeetingDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />
    </div>
  )
} 