"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function SchedulePage() {
  const [lastPitchDate, setLastPitchDate] = useState<Date>()
  const [launchDate, setLaunchDate] = useState<Date>()
  const [dateError, setDateError] = useState<string>()
  const [isScheduled, setIsScheduled] = useState(false)

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

  const handleGoLive = () => {
    if (isDateValid) {
      setIsScheduled(true)
      // TODO: Add API call to save schedule
    }
  }

  const isDateValid = !dateError && lastPitchDate && launchDate

  return (
    <div className="container mx-auto px-5 mt-4">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Date Inputs */}
        <div className="col-span-2">
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="p-6 space-y-6">
              <div className="gap-6">
                <div className="space-y-2">
                  <Label>Last Day to Pitch</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
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

                <div className="mt-4 space-y-2">
                  <Label>Program Launch Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !launchDate && "text-muted-foreground"
                        )}
                        disabled={isScheduled}
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
                        disabled={isScheduled}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {dateError && (
                <p className="text-sm text-destructive">{dateError}</p>
              )}
              {isScheduled && (
                <p className="text-sm text-muted-foreground">
                  Once scheduled, only the last pitch date can be modified. The rest of the Scout is locked.
                </p>
              )}
              <Button 
                variant="outline"
                onClick={handleGoLive}
                className="rounded-[0.35rem]"  
                disabled={!isDateValid || isScheduled}
              >
                {isScheduled ? 'Scheduled' : 'Go Live'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Status */}
        <div className="space-y-6"> 
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm text-muted-foreground">Pending Approvals</h4>
                  <ul className="space-y-1">
                    <li className="text-xs flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>2 team members haven't approved yet</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm text-muted-foreground">Schedule Issues</h4>
                  <ul className="space-y-1">
                    <li className="text-xs text-destructive flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>Last pitch date not selected</span>
                    </li>
                    <li className="text-xs text-destructive flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>Launch date must be before last pitch date</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}