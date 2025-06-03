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
  const [isMember, setIsMember] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editable: isMember,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-3 py-2",
      },
      handleDOMEvents: {
        blur: () => {
          if (isMember) {
            handleSave();
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      if (isMember) {
        setNote(editor.getHTML());
      }
    },
  });

  // Check if user is a member of the scout
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const response = await fetch(`/api/endpoints/scouts/members?scoutId=${scoutId}`);
        if (!response.ok) throw new Error('Failed to fetch scout members');
        const data = await response.json();
        setIsMember(data.some((member: any) => member.userId === userId));
      } catch (error) {
        console.error("Error checking membership:", error);
        setIsMember(false);
      }
    };

    if (userId) {
      checkMembership();
    }
  }, [scoutId, userId]);

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
    if (!editor || isSaving || !isMember) return;
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
          {!isMember && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <p className="text-sm text-muted-foreground">You need to be a member of this scout to add notes</p>
            </div>
          )}
          <EditorContent
            editor={editor}
            placeholder="Use this space to write down anything important about the startup—opportunities, concerns, questions, or insights. Share what stands out, what feels risky, or what we should do next. This helps the team make faster and smarter investment decisions."
            className="w-full h-full bg-[#1a1a1a] rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  );
}
