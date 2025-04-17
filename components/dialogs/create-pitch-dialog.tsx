"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface SelectDaftarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scoutSlug: string;
}

export function SelectDaftarDialog({
  open,
  onOpenChange,
  scoutSlug,
}: SelectDaftarDialogProps) {
  const router = useRouter();
  const [pitchName, setPitchName] = useState("");
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const handleSubmit = async () => {
    if (!pitchName.trim()) return;

    try {
      const res = await fetch("/api/endpoints/pitch/founder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pitchName,
          scoutId, // make sure this is defined in the component
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create pitch");
      }

      const { pitchId } = await res.json();

      router.push(`/founder/${scoutSlug}/${pitchId}/studio`);
      onOpenChange(false);
    } catch (error) {
      console.error("Pitch creation error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-xl font-semibold mb-4">
          New Pitch
        </DialogTitle>

        <div className="space-y-4">
          <Input
            placeholder="Enter pitch name"
            value={pitchName}
            onChange={(e) => setPitchName(e.target.value)}
          />
          <Button
            className="w-full rounded-[0.35rem]"
            onClick={handleSubmit}
            disabled={!pitchName.trim()}
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
