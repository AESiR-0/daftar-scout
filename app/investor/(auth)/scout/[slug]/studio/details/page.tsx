"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import debounce from "lodash.debounce";
import { canEditScout } from "@/lib/utils/scout";
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
  const { toast } = useToast();
  const [canEdit, setCanEdit] = useState(true);

  const [details, setDetails] = useState<ScoutDetails>({
    name: "",
    description: "",
  });

  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch details and check edit permissions
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
        // const canEditStatus = canEditScout(data.data);
        // setCanEdit(canEditStatus);
        
        // if (!canEditStatus) {
        //   toast({
        //     title: "Access Restricted",
        //     description: "This scout is no longer in the planning phase. Editing is restricted.",
        //     variant: "destructive",
        //   });
        // }
      }
    };

    fetchDetails();
  }, [ScoutId, toast]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: ScoutDetails) => {
      if (!canEdit) return;
      
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
    [ScoutId, canEdit]
  );

  // Trigger save on change
  useEffect(() => {
    if (!initialLoad) {
      debouncedSave(details);
    } else {
      setInitialLoad(false);
    }
  }, [details, debouncedSave]);

  return (
    <Card className="border-none mt-4 container mx-auto px-3 bg-[#0e0e0e]">
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scout Name</Label>
            <Input
              value={details.name}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter Scout name"
              disabled={!canEdit}
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
                disabled={!canEdit}
              ></textarea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
