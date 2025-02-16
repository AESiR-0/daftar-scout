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
    title: "Investor Pitch Meeting",
    date: formatDate(new Date().toISOString()), // Today's date
    time: "10:00 AM",
    status: "Confirmed",
    attendees: ["John Doe (Investor)", "Sarah Smith (Investment Analyst)", "Your Team"],
    description: "Initial pitch presentation to potential investors",
    createdBy: "John Doe",
    daftar: "Tech Innovators",
    pitch: "AI Healthcare Platform",
    location: "virtual",
    agenda: "1. Company Overview\n2. Product Demo\n3. Business Model\n4. Funding Requirements\n5. Q&A Session"
  },
  {
    id: "2",
    title: "Due Diligence Discussion",
    date: formatDate((new Date(Date.now() + 86400000).toISOString())), // Tomorrow
    time: "2:00 PM",
    status: "Pending",
    attendees: ["Mike Johnson (VC Partner)", "Emily Brown (Technical Advisor)", "Your Team"],
    description: "Technical and business due diligence meeting",
    createdBy: "Mike Johnson",
    daftar: "FinTech Solutions",
    pitch: "Digital Payment Platform",
    location: "in-person",
    locationAddress: "Dubai Technology Entrepreneur Campus, Silicon Oasis",
    agenda: "1. Technology Stack Review\n2. Market Strategy\n3. Financial Projections\n4. Team Structure"
  },
  {
    id: "3",
    title: "Follow-up Investment Meeting",
    date: formatDate(new Date().toISOString()),
    time: "3:30 PM",
    status: "Confirmed",
    attendees: ["Hassan Ahmed (Lead Investor)", "Fatima Al-Sayed (Partner)", "Investment Team"],
    description: "Follow-up discussion on investment terms",
    createdBy: "Hassan Ahmed",
    daftar: "Healthcare Innovation",
    pitch: "Digital Health Platform",
    location: "in-person",
    locationAddress: "DIFC Innovation Hub, Gate Avenue, Level 1",
    agenda: "1. Valuation Discussion\n2. Term Sheet Review\n3. Growth Strategy\n4. Next Steps"
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
    <div className="space-y-6 container mx-auto px-4">
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
          <Button
          variant="outline"
          className=" rounded-[0.35rem] w-full"
          onClick={() => setScheduleOpen(true)}
        >
          <span className="text-xs">Schedule Meeting</span>
        </Button>
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
                        <Badge variant="outline" className="">
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
                    variant="outline"
                    className="rounded-[0.35rem] "
                    onClick={() => handleAccept(selectedMeeting.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-[0.35rem]"
                    onClick={() => handleReject(selectedMeeting.id)}
                  >
                    Reject
                  </Button>
                  {selectedMeeting.createdBy === currentUser && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-[0.35rem] "
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