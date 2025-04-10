"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import debounce from "lodash.debounce";

// Zod schema for validation
const scoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Vision is required"),
});

type ScoutDetails = z.infer<typeof scoutSchema>;

export default function DetailsPage() {
  const pathname = usePathname();
  const ScoutId = pathname.split("/")[3];

  const [details, setDetails] = useState<ScoutDetails>({
    name: "",
    description: "",
  });

  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch details on mount
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
    [ScoutId]
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
                placeholder="Describe your vision"
              ></textarea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
