"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CreateScoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScoutCreate?: (scout: { scoutId: string; scoutName: string; daftarId: string | null; investorId: string | null }) => void; // Optional callback
}

export function CreateScoutDialog({ open, onOpenChange, onScoutCreate }: CreateScoutDialogProps) {
  const [scoutName, setScoutName] = useState("");
  const [daftarId, setDaftarId] = useState("");
  const [investorId, setInvestorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!scoutName.trim()) {
      toast({
        title: "Scout name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/endpoints/scouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scoutName,
          daftarId: daftarId.trim() || null,
          investorId: investorId.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create scout");
      }

      const data = await response.json();
      const newScout = data.data; // Extract the created scout from response

      toast({
        title: "Scout created",
        description: `Scout "${newScout.scoutName}" (ID: ${newScout.scoutId}) created successfully`,
      });

      // Call the optional callback with the new scout data
      if (onScoutCreate) {
        onScoutCreate({
          scoutId: newScout.scoutId,
          scoutName: newScout.scoutName,
          daftarId: newScout.daftarId,
          investorId: newScout.investorPitch, // Assuming investorId maps to investorPitch
        });
      }

      // Reset form and close dialog
      setScoutName("");
      setDaftarId("");
      setInvestorId("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Scout</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scoutName">Scout Name</Label>
            <Input
              id="scoutName"
              placeholder="Enter scout name"
              value={scoutName}
              onChange={(e) => setScoutName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            className="rounded-[0.35rem] w-full"
            onClick={handleSubmit}
            variant="secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}