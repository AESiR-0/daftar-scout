"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function SchedulePage() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3]; // Assuming URL is /scouts/[scoutId]/schedule

  const [lastPitchDate, setLastPitchDate] = useState<Date>();
  const [launchDate, setLaunchDate] = useState<Date>();
  const [dateError, setDateError] = useState<string>();
  const [isScheduled, setIsScheduled] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDateValid = !dateError && lastPitchDate && launchDate;

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch(
          `/api/endpoints/scouts/schedule?scoutId=${scoutId}`
        );
        const data = await res.json();

        if (res.status == 200) {
          const scout = data.data;
          if (scout.isApprovedByAll) setIsApproved(true);
          if (scout.lastDayToPitch)
            setLastPitchDate(new Date(scout.lastDayToPitch));
          if (scout.programLaunchDate)
            setLaunchDate(new Date(scout.programLaunchDate));
          if (scout.status === "Scheduled") setIsScheduled(true);
        } else {
          console.error("Error fetching scout:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch scout schedule", err);
      }
    }

    if (scoutId) fetchSchedule();
  }, [scoutId]);
  const handleLaunchDateSelect = (date: Date | undefined) => {
    setLaunchDate(date);
    if (date && lastPitchDate && date > lastPitchDate) {
      setDateError("Launch date cannot be after the last pitch date");
    } else {
      setDateError("");
    }
  };

  const handleLastPitchDateSelect = (date: Date | undefined) => {
    setLastPitchDate(date);
    if (date && launchDate && launchDate > date) {
      setDateError("Launch date cannot be after the last pitch date");
    } else {
      setDateError("");
    }
  };

  const handleGoLive = async () => {
    if (!isDateValid || !scoutId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/endpoints/scouts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoutId,
          lastDayToPitch: lastPitchDate?.toISOString(),
          programLaunchDate: launchDate?.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsScheduled(true);
      } else {
        console.error("Error scheduling scout:", data.error);
      }
    } catch (err) {
      console.error("Failed to schedule", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-5 mt-4">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-6">
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
                        {lastPitchDate
                          ? format(lastPitchDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={lastPitchDate}
                        onSelect={handleLastPitchDateSelect}
                        initialFocus
                        disabled={isScheduled}
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

              {dateError && <p className="text-sm text-white">{dateError}</p>}

              {isScheduled && (
                <p className="text-sm text-muted-foreground">
                  Once scheduled, only the last pitch date can be modified. The
                  rest of the Scout is locked.
                </p>
              )}

              <Button
                variant="outline"
                onClick={handleGoLive}
                className="rounded-[0.35rem]"
                disabled={!isDateValid || isScheduled || loading || !isApproved}
              >
                {loading
                  ? "Scheduling..."
                  : isScheduled
                  ? "Scheduled"
                  : "Go Live"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Optional): Can keep actions, status, etc. */}
        <div className="space-y-6">
          <Card className="border-none bg-[#0e0e0e]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h4 className="text-sm text-muted-foreground">
                  Schedule Issues
                </h4>
                <ul className="space-y-1 text-xs text-white">
                  {!lastPitchDate && <li>• Last pitch date not selected</li>}
                  {launchDate &&
                    lastPitchDate &&
                    launchDate > lastPitchDate && (
                      <li>• Launch date must be before last pitch date</li>
                    )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
