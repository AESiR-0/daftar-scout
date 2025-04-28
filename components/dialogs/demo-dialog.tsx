"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface VideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoDialog({ open, onOpenChange }: VideoDialogProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[40rem] max-h-[80vh] p-0 border-none">
        <Card className="bg-[#0e0e0e] border-none flex rounded-lg overflow-hidden">
          {/* Video Player */}
          <div className=" w-[300px] h-[533px]  bg-black">
            <video
              className="w-full h-full object-cover"
              controls
              autoPlay
              poster="/assets/torricke-barton.jpg"
            >
              <source src="/assets/torricke-barton.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Content Below Video */}
          <div className="p-4 space-y-4">
            {/* Title and Metadata */}
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-white leading-tight">
                Demo
              </h1>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">John Smith</p>
                  <p className="text-xs text-muted-foreground">
                    Chief Investment Officer • Published 2024
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
