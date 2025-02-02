"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ScheduleMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Sample data - replace with real data
const daftars = [
  { id: "1", name: "Tech Startups" },
  { id: "2", name: "Healthcare Innovation" },
]

const pitches = [
  { id: "1", name: "AI Solution Pitch" },
  { id: "2", name: "HealthTech Platform" },
]

const users = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Sarah Smith" },
  { id: "3", name: "Mike Johnson" },
]

export function ScheduleMeetingDialog({ open, onOpenChange }: ScheduleMeetingDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    daftar: "",
    pitch: "",
    attendees: [] as string[],
    date: undefined as Date | undefined,
    hours: "",
    minutes: "",
    period: "",
    location: "",
    locationAddress: "",
    agenda: ""
  })

  const hours = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1)
  }))

  const minutes = Array.from({ length: 12 }, (_, i) => ({
    value: String(i * 5).padStart(2, '0'),
    label: String(i * 5).padStart(2, '0')
  }))

  const handleSubmit = () => {
    const formattedTime = `${formData.hours}:${formData.minutes} ${formData.period}`
    console.log("Meeting scheduled:", {
      ...formData,
      time: formattedTime
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>  </DialogTitle>
      <DialogContent className="max-w-3xl h-[600px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Schedule Meeting</h2>
              <p className="text-sm text-muted-foreground">Fill in the details to schedule a new meeting</p>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Meeting Title</Label>
                <Input
                  placeholder="Enter meeting title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Invite Daftar/Users</Label>
                <Select
                  value={formData.attendees[0]}
                  onValueChange={(value) => setFormData({ ...formData, attendees: [...formData.attendees, value] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Daftar/Users" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => !formData.attendees.includes(user.id))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.attendees.map((attendeeId) => {
                    const user = users.find(u => u.id === attendeeId)
                    return user ? (
                      <Badge
                        key={user.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {user.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setFormData({
                            ...formData,
                            attendees: formData.attendees.filter(id => id !== user.id)
                          })}
                        />
                      </Badge>
                    ) : null
                  })}
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
                        {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({ ...formData, date: date || undefined })}
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
                        onValueChange={(value) => setFormData({ ...formData, hours: value })}
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
                      onValueChange={(value) => setFormData({ ...formData, minutes: value })}
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
                      onValueChange={(value) => setFormData({ ...formData, period: value })}
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
                  onValueChange={(value) => setFormData({
                    ...formData,
                    location: value,
                    locationAddress: value === "virtual" ? "" : formData.locationAddress
                  })}
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
                      onChange={(e) => setFormData({
                        ...formData,
                        locationAddress: e.target.value
                      })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Agenda</Label>
                <Textarea
                  placeholder="Enter meeting agenda"
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Schedule Meeting
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 