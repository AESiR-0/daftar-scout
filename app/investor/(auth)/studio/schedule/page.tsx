"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter, usePathname } from "next/navigation"
import { Check, AlertCircle, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"

const programSteps = [
  { id: 'details', title: 'Program Details', status: 'completed' },
  { id: 'document', title: 'Program Documents', status: 'completed' },
  { id: 'audience', title: 'Target Audience', status: 'completed' },
  { id: 'founder-pitch', title: "Founder's Pitch", status: 'completed' },
  { id: 'investor-pitch', title: "Investor's Pitch", status: 'completed' },
  { id: 'faqs', title: 'FAQs', status: 'completed' },
  { id: 'invite', title: 'Database Upload', status: 'completed' },
  { id: 'schedule', title: 'Program Schedule', status: 'pending' },
] as const

// Simulated approval status
const teamApprovalStatus = {
  allApproved: false,
  collaboratorPending: true
}

function ScheduleContent() {
  const router = useRouter()
  const pathname = usePathname()
  const [lastPitchDate, setLastPitchDate] = useState<Date>()
  const [launchDate, setLaunchDate] = useState<Date>()
  const [dateError, setDateError] = useState<string>("")

  const handleSave = () => {
    console.log("Saving schedule:", { lastPitchDate, launchDate })
    router.push("/scout")
  }

  const handleLaunchDateSelect = (date: Date | undefined) => {
    setLaunchDate(date)
    if (date && lastPitchDate && date > lastPitchDate) {
      setDateError("Launch date cannot be after the last pitch date")
    } else {
      setDateError("")
    }
  }

  const handleLastPitchDateSelect = (date: Date | undefined) => {
    setLastPitchDate(date)
    if (date && launchDate && launchDate > date) {
      setDateError("Launch date cannot be after the last pitch date")
    } else {
      setDateError("")
    }
  }

  const isDateValid = !dateError && lastPitchDate && launchDate

  return (
    <div className="gap-8 container mx-auto px-4">
      <div className="max-w-6xl space-y-8">
        {/* Progress Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Program Creation Progress</h3>
          <div className="grid grid-cols-2 gap-3">
            {programSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-3 p-3 rounded-[0.35rem]  bg-muted/50"
              >
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center",
                  step.status === 'completed'
                    ? "bg-blue-100 text-blue-600"
                    : "bg-orange-100 text-orange-600"
                )}>
                  {step.status === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Program Schedule</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Last Day to Pitch</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9",
                      !lastPitchDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {lastPitchDate ? format(lastPitchDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={lastPitchDate}
                    onSelect={handleLastPitchDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Program Launch Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9",
                      !launchDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {launchDate ? format(launchDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={launchDate}
                    onSelect={handleLaunchDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {dateError && (
            <p className="text-sm text-red-500 text-center">{dateError}</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 pt-4">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={
              !isDateValid || 
              !teamApprovalStatus.allApproved || 
              teamApprovalStatus.collaboratorPending
            }
          >
            Save
          </Button>
          {teamApprovalStatus.collaboratorPending && (
            <p className="text-xs text-yellow-500">Waiting for team approvals</p>
          )}
          {!isDateValid && !dateError && (
            <p className="text-xs text-muted-foreground">Please select both dates</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScheduleContent;