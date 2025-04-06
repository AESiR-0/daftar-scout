"use client";

import { useState, useEffect } from "react";
import { getCookie } from "@/lib/helper/cookies";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Daftar {
  id: string;
  name: string;
  description: string;
  profileUrl: string;
}

interface SelectDaftarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNew: () => void;
}

export function SelectDaftarDialog({
  open,
  onOpenChange,
  onCreateNew,
}: SelectDaftarDialogProps) {
  const handleDaftarSelect = (daftarId: string) => {
    // Handle daftar selection
    document.cookie = `selectedDaftarId=${daftarId}; path=/; max-age=${
      60 * 60 * 24
    }`;
    document.cookie = `profileUrl=${
      daftars.find((daftar) => daftar.id === daftarId)?.profileUrl
    }; path=/; max-age=${60 * 60 * 24}`;

    setSelected(daftarId);
    onOpenChange(false);
  };
  const [selected, setSelected] = useState<string>(
    getCookie("selectedDaftarId") || " "
  );

  const [daftars, setDaftars] = useState<Daftar[]>([
    { id: "", name: "", description: "", profileUrl: "" },
  ]);
  useEffect(() => {
    async function getDaftars() {
      const response = await fetch("/api/endpoints/daftar", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setDaftars(data);
    }
    getDaftars();
  }, []);
  if (daftars[0].id === "") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Daftar</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">Loading...</div>
          </ScrollArea>

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={onCreateNew}
              className="gap-2 rounded-[0.35rem]"
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Daftar</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {daftars.map((daftar) => (
              <div
                key={daftar.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  selected == daftar.id ? "bg-muted/50 hover:bg-muted" : ""
                }`}
                onClick={() => handleDaftarSelect(daftar.id)}
              >
                <h3 className="font-medium">{daftar.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {daftar.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={onCreateNew}
            className="gap-2 rounded-[0.35rem]"
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
