"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";

export interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: () => void;
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  onScheduled,
}: ScheduleMeetingDialogProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    attendeeEmail: "",
    attendees: [] as string[],
    date: new Date(),
    hours: "",
    minutes: "",
    period: "",
    location: "virtual",
    locationAddress: "",
    agenda: "",
  });

  const hours = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: String(i + 1),
  }));

  const minutes = Array.from({ length: 12 }, (_, i) => ({
    value: String(i * 5).padStart(2, "0"),
    label: String(i * 5).padStart(2, "0"),
  }));

  const handleAddAttendee = () => {
    if (formData.attendeeEmail && !formData.attendees.includes(formData.attendeeEmail)) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, formData.attendeeEmail],
        attendeeEmail: "",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formattedTime = `${formData.hours}:${formData.minutes} ${formData.period}`;
      const [hours, minutes] = formattedTime.split(":");
      const isPM = formData.period === "PM";
      const hour = parseInt(hours) + (isPM ? 12 : 0);

      const startTime = new Date(formData.date!);
      startTime.setHours(hour, parseInt(minutes), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1); // Default 1-hour meeting

      // Include current user's email in attendees list
      const allAttendees = session?.user?.email
        ? [...formData.attendees, session.user.email]
        : formData.attendees;

      const response = await fetch("/api/endpoints/calendar/create-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.agenda,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          attendees: allAttendees,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create meeting");
      }

      onOpenChange(false);
      onScheduled?.(); // Call the onScheduled callback if provided
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle> </DialogTitle>
      <DialogContent className="max-w-3xl h-[600px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Meeting Title</Label>
                <Input
                  placeholder="Enter meeting title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Add Attendees</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter attendee email"
                    value={formData.attendeeEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, attendeeEmail: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAttendee();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddAttendee}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.attendees.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {email}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            attendees: formData.attendees.filter(
                              (e) => e !== email
                            ),
                          })
                        }
                      />
                    </Badge>
                  ))}
                  {session?.user?.email && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {session.user.email} (You)
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date
                          ? format(formData.date, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) =>
                          setFormData({ ...formData, date: date || new Date() })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={formData.hours}
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, hours: value })
                        }
                      >
                        <SelectTrigger className="pl-8">
                          <SelectValue placeholder="HH" />
                        </SelectTrigger>
                        <SelectContent>
                          {hours.map((hour) => (
                            <SelectItem key={hour.value} value={hour.value}>
                              {hour.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <span className="text-xl">:</span>

                    <Select
                      value={formData.minutes}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, minutes: value })
                      }
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map((minute) => (
                          <SelectItem key={minute.value} value={minute.value}>
                            {minute.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.period}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, period: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      location: value,
                      locationAddress:
                        value === "virtual" ? "" : formData.locationAddress,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual Meeting</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>

                {formData.location === "in-person" && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter meeting location"
                      value={formData.locationAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          locationAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Agenda</Label>
                <Textarea
                  placeholder="Enter meeting agenda"
                  value={formData.agenda}
                  onChange={(e) =>
                    setFormData({ ...formData, agenda: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                className="rounded-[0.35rem]"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 rounded-[0.35rem] hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
