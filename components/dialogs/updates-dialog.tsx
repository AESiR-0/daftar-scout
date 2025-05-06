"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Trash2, Bold, Italic, List, Link as LinkIcon } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/format-date";
import { useToast } from "@/hooks/use-toast";

interface Update {
  id: string;
  content: string;
  date: string;
}

interface UpdatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b p-2 flex gap-1">

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-accent" : ""}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-accent" : ""}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-accent" : ""}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("Enter URL");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={editor.isActive("link") ? "bg-accent" : ""}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function UpdatesDialog({
  open,
  onOpenChange,
}: UpdatesDialogProps) {

  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] px-3 py-2",
      },
    },
  });

  // Fetch updates when dialog opens
  useEffect(() => {
    if (open && scoutId) {
      fetchUpdates();
    }
  }, [open, scoutId]);

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/endpoints/scouts/updates?scoutId=${scoutId}`);
      if (!response.ok) throw new Error('Failed to fetch updates');
      const data = await response.json();
      setUpdates(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load updates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (editor?.isEmpty) {
      toast({
        title: "Validation Error",
        description: "Update content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!scoutId) {
      toast({
        title: "Validation Error",
        description: "Scout ID is required",
        variant: "destructive",
      });
      return;
    }

    const content = editor?.getHTML() || "";
    if (!content.trim()) {
      toast({
        title: "Validation Error",
        description: "Update content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/endpoints/scouts/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoutId, content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          `Failed to create update (${response.status}): ${response.statusText}`
        );
      }

      const newUpdate = await response.json();
      setUpdates((prev) => [newUpdate, ...prev]);
      editor?.commands.setContent("");

      toast({
        title: "Success",
        description: "Update posted successfully",
      });
    } catch (error: any) {
      console.error("Error posting update:", error);
      toast({
        title: "Error posting update",
        description: error.message || "Failed to post update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/endpoints/scouts/updates?updateId=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error('Failed to delete update');

      setUpdates((prev) => prev.filter((update) => update.id !== id));

      toast({
        title: "Success",
        description: "Update deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete update",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Updates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* New Update Form */}
          <div className="space-y-2 flex flex-col items-center gap-2 rounded-md">
            <MenuBar editor={editor} />
            <EditorContent
              editor={editor}
              className="w-full border rounded-lg bg-background"
            />
            <div className="p-2 w-full flex justify-start">
              <Button
                onClick={handleSubmit}
                size="sm"
                className="w-fit bg-blue-600 rounded-[0.35rem] hover:bg-blue-700 text-white"
                disabled={editor?.isEmpty || isLoading}
              >
                Post Update
              </Button>
            </div>
          </div>

          {/* Updates List */}
          <ScrollArea className="h-[300px] rounded-md">
            <div className="space-y-3 p-4">
              {isLoading ? (
                <div className="text-center text-sm text-muted-foreground">
                  Loading updates...
                </div>
              ) : updates.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">
                  No updates yet
                </div>
              ) : (
                updates.map((update) => (
                  <div
                    key={update.id}
                    className="p-4 rounded-[0.35rem] border group bg-background"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-2">
                        <div
                          className="text-sm prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: update.content }}
                        />
                        <p className="text-xs text-muted-foreground">
                          {formatDate(update.date)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(update.id)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
