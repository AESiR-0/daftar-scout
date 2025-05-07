"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Check, X, Trash2, Video, MapPin, Folder, Presentation, FileText } from "lucide-react";
import { ScheduleMeetingDialog } from "@/components/dialogs/schedule-meeting-dialog";
import { useToast } from "@/hooks/use-toast";
import formatDate from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

interface Meeting {
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
  organizer?: string;
}

export default function MeetingsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/endpoints/calendar/meetings');
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const data = await response.json();
      setMeetings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch meetings',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Get meetings for selected date
  const selectedDateMeetings = selectedDate
    ? meetings.filter(
      (m) => new Date(m.startTime).toDateString() === selectedDate.toDateString()
    )
    : [];

  // Get all dates that have meetings
  const meetingDates = meetings.reduce((dates, meeting) => {
    const date = new Date(meeting.startTime);
    dates[date.toDateString()] = true;
    return dates;
  }, {} as Record<string, boolean>);

  const canRespondToMeeting = (meeting: Meeting) => {
    // Can't respond if already accepted or rejected
    if (meeting.status === 'accepted' || meeting.status === 'rejected') {
      return false;
    }

    // Can't respond if you're the organizer
    if (meeting.organizer === session?.user?.email) {
      return false;
    }

    return true;
  };

  const handleAcceptMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/endpoints/calendar/meetings/${meetingId}/accept`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to accept meeting');
      }

      // Refresh meetings list
      await fetchMeetings();

      toast({
        title: 'Success',
        description: 'Meeting accepted successfully',
      });
    } catch (error) {
      console.error('Error accepting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept meeting',
        variant: 'destructive',
      });
    }
  };

  const handleRejectMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/endpoints/calendar/meetings/${meetingId}/reject`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reject meeting');
      }

      // Refresh meetings list
      await fetchMeetings();

      toast({
        title: 'Success',
        description: 'Meeting rejected successfully',
      });
    } catch (error) {
      console.error('Error rejecting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject meeting',
        variant: 'destructive',
      });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || new Date());
  };

  return (
    <div className="space-y-6 container mx-auto px-4">
      {/* Three Column Layout */}
      <div className="flex gap-6">
        {/* Calendar and Schedule Button Column */}
        <div className="space-y-6">
          <div className="border rounded-[0.35rem] p-4">
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
            className="rounded-[0.35rem] w-full"
            onClick={() => setScheduleMeetingOpen(true)}
          >
            <span className="text-xs">Schedule Meeting</span>
          </Button>
        </div>

        {/* Selected Date Schedule Column */}
        <div className="w-1/3 border-l px-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                {selectedDate && selectedDate.toDateString() === new Date().toDateString()
                  ? "Today's Schedule"
                  : "Schedule"}
              </h3>
            </div>
          </div>

          <div className="space-y-2">
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
            ) : selectedDateMeetings.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No meetings scheduled for {selectedDate && selectedDate.toDateString() === new Date().toDateString()
                  ? "today"
                  : "this day"}
              </div>
            ) : (
              selectedDateMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={cn(
                    "flex items-center gap-4 p-3 border rounded-[0.35rem] cursor-pointer hover:border-blue-600",
                    selectedMeeting?.id === meeting.id && "border-blue-600"
                  )}
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <div className="w-20 text-sm font-medium">
                    {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    <Badge variant="secondary">
                      {selectedMeeting.status[0].toUpperCase() + selectedMeeting.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(selectedMeeting.startTime).toLocaleString()} - {new Date(selectedMeeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {selectedMeeting.meetLink ? (
                    <>
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={selectedMeeting.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedMeeting.location}</span>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Attendees</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedMeeting.attendees.map((attendee) => (
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
                    {selectedMeeting.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMeeting.organizer === session?.user?.email ? (
                    <p className="text-sm text-muted-foreground">You are the organizer of this meeting</p>
                  ) : selectedMeeting.status === 'accepted' ? (
                    <p className="text-sm text-green-600">You have accepted this meeting</p>
                  ) : selectedMeeting.status === 'rejected' ? (
                    <p className="text-sm text-red-600">You have rejected this meeting</p>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[0.35rem]"
                        onClick={() => handleAcceptMeeting(selectedMeeting.id)}
                        disabled={!canRespondToMeeting(selectedMeeting)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[0.35rem]"
                        onClick={() => handleRejectMeeting(selectedMeeting.id)}
                        disabled={!canRespondToMeeting(selectedMeeting)}
                      >
                        Reject
                      </Button>
                    </>
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
        open={scheduleMeetingOpen}
        onOpenChange={setScheduleMeetingOpen}
        onScheduled={fetchMeetings}
      />
    </div>
  );
}