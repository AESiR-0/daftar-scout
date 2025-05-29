"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import debounce from "lodash.debounce";
import { Lock } from "lucide-react";
import { useIsScoutLocked } from "@/contexts/isScoutLockedContext";
import { useToast } from "@/hooks/use-toast";

// Zod schema for validation
const scoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Vision is required"),
});

type ScoutDetails = z.infer<typeof scoutSchema>;

export default function DetailsPage() {
  const pathname = usePathname();
  const ScoutId = pathname.split("/")[3];
  const { isLocked, isLoading: isLockLoading } = useIsScoutLocked();
  const { toast } = useToast();

  const [details, setDetails] = useState<ScoutDetails>({
    name: "",
    description: "",
  });

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (isLocked) {
      toast({
        title: "Scout is Locked",
        description: "This scout is not in planning stage anymore and cannot be modified.",
        variant: "destructive",
      });
    }
  }, [isLocked, toast]);

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await fetch(
        `/api/endpoints/scouts/details?scoutId=${ScoutId}`
      );
      const data = await res.json();
      if (data?.data) {
        setDetails({
          name: data.data.scoutName || "",
          description: data.data.scoutVision || "",
        });
      }
    };

    fetchDetails();
  }, [ScoutId]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: ScoutDetails) => {
      if (isLocked) return;
      
      const parsed = scoutSchema.safeParse(data);
      if (!parsed.success) return;

      await fetch("/api/endpoints/scouts/details", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scoutId: ScoutId,
          scoutName: data.name,
          scoutVision: data.description,
        }),
      });
    }, 800),
    [ScoutId, isLocked]
  );

  // Trigger save on change
  useEffect(() => {
    if (!initialLoad) {
      debouncedSave(details);
    } else {
      setInitialLoad(false);
    }
  }, [details, debouncedSave]);

  if (isLockLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <Card className="border-none mt-4 container mx-auto px-3 bg-[#0e0e0e]">
      <CardContent>
        {isLocked && (
          <div className="flex items-center gap-2 text-destructive mb-4">
            <Lock className="h-5 w-5" />
            <p className="text-sm font-medium">The scout is locked. You can not make any changes to it.</p>
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scout Name</Label>
            <Input
              value={details.name}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter Scout name"
              disabled={isLocked}
            />
          </div>

          <div className="space-y-2">
            <Label>Scout&apos;s Vision</Label>
            <div className="rounded-lg">
              <textarea
                className="w-full h-[250px] bg-muted/50 text-white border p-4 rounded-[0.35rem]"
                value={details.description}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Use this space to explain why you're scouting this startup and what specific value you're hoping it adds to your portfolio. This helps your team understand your thinking and stay focused while scouting."
                disabled={isLocked}
              ></textarea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
