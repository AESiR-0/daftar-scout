"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface InvestorsNoteProps {
  scoutId: string;
  pitchId: string;
  userId: string | null;
}

interface NoteResponse {
  note: string;
  id: string;
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
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevNoteRef = useRef<string>("");

  // Check if user is a member of the scout
  useEffect(() => {
    const checkMembership = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/endpoints/scouts/members?scoutId=${scoutId}`);
        if (!response.ok) throw new Error('Failed to fetch scout members');
        const data = await response.json();
        const isUserMember = data.some((member: any) => member.userId === userId);
        setIsMember(isUserMember);
        if (!isUserMember) {
          toast({
            title: "Demo Mode",
            description: "This is a demo, cannot be edited",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error checking membership:", error);
        setIsMember(false);
      }
    };
    checkMembership();
  }, [userId, scoutId, toast]);

  // Fetch the note when the component mounts
  useEffect(() => {
    const fetchNote = async () => {
      if (!userId) return;
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
        prevNoteRef.current = fetchedNote;
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
  }, [userId, scoutId, pitchId, toast]);

  // Debounced autosave effect
  useEffect(() => {
    if (!isMember || !userId) return;
    if (note === prevNoteRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSaving(true);
      toast({
        title: "Saving...",
        description: "Saving your note.",
        variant: "default",
      });
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
            note,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save note");
        }
        const data = await response.json();
        if (data.status === "success") {
          prevNoteRef.current = note;
          toast({
            title: "Note saved successfully",
            description: "Your note has been saved.",
            variant: "success",
          });
        } else {
          throw new Error("Failed to save note");
        }
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
    }, 800); // 800ms debounce
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [note, isMember, userId, scoutId, pitchId, toast]);

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
        <div className="border h-[400px] rounded-xl overflow-hidden flex flex-col">
          {isMember ? (
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              disabled={!isMember}
              placeholder={note}
              className="w-full h-full bg-[#1a1a1a] rounded-xl p-3 text-white resize-none border-none outline-none flex-1"
            />
          ) : (
            <p className="w-full h-full bg-[#1a1a1a] rounded-xl p-3 text-white whitespace-pre-line flex-1">
              {note}
            </p>
          )}
          <div className="text-xs text-muted-foreground mt-2 self-end">
            {isSaving ? "Saving..." : ""}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
