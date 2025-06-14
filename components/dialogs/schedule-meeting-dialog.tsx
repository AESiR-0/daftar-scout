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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: () => void;
}

const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  attendeeEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  attendees: z.array(z.string().email("Invalid email")).min(1, "At least one attendee is required"),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "Invalid date",
  }),
  hours: z.string().min(1, "Hour is required"),
  minutes: z.string().min(1, "Minute is required"),
  period: z.enum(["AM", "PM"], {
    required_error: "AM/PM is required",
  }),
  location: z.enum(["virtual", "in-person"], {
    required_error: "Location type is required",
  }),
  locationAddress: z.string().optional(),
  agenda: z.string().min(1, "Agenda is required"),
}).refine((data) => {
  // This will be validated in the onSubmit function
  return true;
}, {
  message: "At least one attendee is required",
  path: ["attendees"],
});

type MeetingFormData = z.infer<typeof meetingSchema>;

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  onScheduled,
}: ScheduleMeetingDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      attendeeEmail: "",
      attendees: [],
      date: new Date(),
      hours: "",
      minutes: "",
      period: "AM",
      location: "virtual",
      locationAddress: "",
      agenda: "",
    },
  });

  const formData = watch();

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
      setValue("attendees", [...formData.attendees, formData.attendeeEmail]);
      setValue("attendeeEmail", "");
    }
  };

  const onSubmit = async (data: MeetingFormData) => {
    try {
      setIsSubmitting(true);
      const formattedTime = `${data.hours}:${data.minutes} ${data.period}`;
      const [hours, minutes] = formattedTime.split(":");
      const isPM = data.period === "PM";
      const hour = parseInt(hours) + (isPM ? 12 : 0);

      const startTime = new Date(data.date);
      startTime.setHours(hour, parseInt(minutes), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const allAttendees = session?.user?.email
        ? [...data.attendees, session.user.email]
        : data.attendees;

      const response = await fetch("/api/endpoints/calendar/create-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.agenda,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          attendees: allAttendees,
          location: data.location === "virtual" ? "Virtual Meeting" : data.locationAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create meeting");
      }

      onOpenChange(false);
      reset();
      toast({
        title: "Success",
        description: "Meeting scheduled successfully",
      });
      router.refresh();
      onScheduled?.();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule meeting",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle> </DialogTitle>
      <DialogContent className="max-w-3xl h-[600px] p-0">
        <ScrollArea className="h-full">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Meeting Title</Label>
                <Input
                  placeholder="Enter meeting title"
                  {...register("title")}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Add Attendees</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter attendee email"
                    {...register("attendeeEmail")}
                    className={errors.attendeeEmail ? "border-red-500" : ""}
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
                {errors.attendeeEmail && (
                  <p className="text-sm text-red-500">{errors.attendeeEmail.message}</p>
                )}
                {errors.attendees && (
                  <p className="text-sm text-red-500">{errors.attendees.message}</p>
                )}
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
                          setValue(
                            "attendees",
                            formData.attendees.filter((e) => e !== email)
                          )
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
                          !formData.date && "text-muted-foreground",
                          errors.date && "border-red-500"
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
                        onSelect={(date) => setValue("date", date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={formData.hours}
                        onValueChange={(value) => setValue("hours", value)}
                      >
                        <SelectTrigger className={cn("pl-8", errors.hours && "border-red-500")}>
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
                      onValueChange={(value) => setValue("minutes", value)}
                    >
                      <SelectTrigger className={cn("w-[70px]", errors.minutes && "border-red-500")}>
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
                      onValueChange={(value) => setValue("period", value as "AM" | "PM")}
                    >
                      <SelectTrigger className={errors.period && "border-red-500"}>
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(errors.hours || errors.minutes || errors.period) && (
                    <p className="text-sm text-red-500">Time is required</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => {
                    setValue("location", value as "virtual" | "in-person");
                    if (value === "virtual") {
                      setValue("locationAddress", "");
                    }
                  }}
                >
                  <SelectTrigger className={errors.location && "border-red-500"}>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual Meeting</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}

                {formData.location === "in-person" && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter meeting location"
                      {...register("locationAddress")}
                      className={errors.locationAddress ? "border-red-500" : ""}
                    />
                    {errors.locationAddress && (
                      <p className="text-sm text-red-500">{errors.locationAddress.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Agenda</Label>
                <Textarea
                  placeholder="Enter meeting agenda"
                  {...register("agenda")}
                  className={cn("min-h-[100px]", errors.agenda && "border-red-500")}
                />
                {errors.agenda && (
                  <p className="text-sm text-red-500">{errors.agenda.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-[0.35rem]"
                onClick={() => {
                  reset();
                  onOpenChange(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 rounded-[0.35rem] hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
