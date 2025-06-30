"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";

interface JournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JournalDialog({ open, onOpenChange }: JournalDialogProps) {
  const [note, setNote] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: note,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setNote(html);
    },
  });

  // Fetch note ONLY when dialog opens
  useEffect(() => {
    if (!open) return;

    async function fetchNote() {
      try {
        const res = await fetch("/api/endpoints/users/journal");
        if (res.status === 200) {
          const data = await res.json();
          setNote(data.journal);
          editor?.commands.setContent(data.journal);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch journal",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Something went wrong fetching journal",
          variant: "destructive",
        });
      }
    }

    fetchNote();
  }, [open, editor]);

  // Debounced auto-save
  useEffect(() => {
    if (!note) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/endpoints/users/journal", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ journal: note }),
        });

        if (res.status !== 200) {
          toast({
            title: "Error",
            description: "Failed to save note",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to save note",
          variant: "destructive",
        });
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [note]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[45rem] p-0 gap-0">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[28rem]">
          <div className="flex items-center gap-2 p-4">
            <h2 className="text-sm font-medium">Journal</h2>
          </div>
          <div className="flex-1 p-4">
            <ScrollArea>
              <EditorContent
                placeholder="Your journal, your pace.
A quiet spot to hyper-focus and structure your thoughts."
                editor={editor}
                className="h-full max-h-[22rem]  prose max-w-2xl "
                style={{ minHeight: 0 }}
              />
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
