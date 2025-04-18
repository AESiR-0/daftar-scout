"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface InvestorsNoteProps {
  scoutId: string;
  pitchId: string;
  userId: string | null;
}

export function InvestorsNote({
  scoutId,
  pitchId,
  userId,
}: InvestorsNoteProps) {
  const { toast } = useToast();
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  console.log("user id", userId);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-3 py-2",
      },
      handleDOMEvents: {
        blur: () => {
          handleSave();
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      setNote(editor.getHTML());
    },
  });

  // Fetch the note when the component mounts
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/endpoints/pitch/investor/note?scoutId=${scoutId}&pitchId=${pitchId}&investorId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch note");
        }

        const data = await response.json();
        const fetchedNote = data.note || "";
        setNote(fetchedNote);
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(fetchedNote);
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        toast({
          title: "Error",
          description: "Failed to load investor note",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [scoutId, pitchId, userId, editor, toast]);

  // Handle saving the note
  const handleSave = async () => {
    if (!editor || isSaving) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/endpoints/pitch/investor/note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scoutId,
          pitchId,
          userId,
          note: editor.getHTML(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save note");
      }

      toast({
        title: "Success",
        description: "Note saved successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[450px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Card className="border-none bg-[#0e0e0e]">
      <CardHeader>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border h-[400px] rounded-xl overflow-hidden">
          <EditorContent
            editor={editor}
            className="w-full h-full bg-[#1a1a1a] rounded-xl"
          />
        </div>
        {/* <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || !editor}
            className="bg-blue-600 hover:bg-blue-700 rounded-[0.35rem]"
          >
            {isSaving ? "Saving..." : "Save Note"}
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
}
