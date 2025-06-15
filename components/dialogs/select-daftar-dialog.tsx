"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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
  daftars: Daftar[];
  selected: string;
  onSelect: (id: string) => void;
}
export function SelectDaftarDialog({
  open,
  onOpenChange,
  onCreateNew,
  daftars,
  selected,
  onSelect,
}: SelectDaftarDialogProps) {
  const router = useRouter();
  const handleDaftarSelect = (daftarId: string) => {
    document.cookie = `selectedDaftarId=${daftarId}; path=/; max-age=${60 * 60 * 24
      }`;
    document.cookie = `profileUrl=${daftars.find((daftar) => daftar.id === daftarId)?.profileUrl || ""
      }; path=/; max-age=${60 * 60 * 24}`;

    onSelect(daftarId);
    onOpenChange(false);
    router.refresh();
    toast({
      title: "Daftar Selected",
      description: `You have selected ${daftars.find((daftar) => daftar.id === daftarId)?.name}, refresh to see the Daftar's Scouts`,
    });
  };

  if (!daftars || daftars.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Daftar</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">No Daftars found. Please Create One</div>
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
                className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${selected === daftar.id ? "bg-muted/50 hover:bg-muted" : ""
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
