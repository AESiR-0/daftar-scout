"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname, useRouter } from "next/navigation";
import { useIsScoutLocked } from "@/contexts/isScoutLockedContext";
import { useToast } from "@/hooks/use-toast";

interface FAQ {
  id: string;
  faqQuestion: string;
  faqAnswer: string;
}

function FaqsContent() {
  const pathname = usePathname();
  const scoutId = pathname.split("/")[3];
  const { isLocked, isLoading: isLockLoading } = useIsScoutLocked();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLocked) {
      toast({
        title: "Scout is Locked",
        description: "This scout is not in planning stage anymore and cannot be modified.",
        variant: "destructive",
      });
    }
  }, [isLocked, toast]);

  useEffect(() => {
    fetchFAQs(scoutId);
  }, [scoutId]);

  const fetchFAQs = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/endpoints/scouts/faqs?scoutId=${id}`);
      const data = await res.json();
      setFaqs(data || []);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFAQ = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const res = await fetch("/api/endpoints/scouts/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoutId,
          faqQuestion: newQuestion,
          faqAnswer: newAnswer,
        }),
      });
      const data = await res.json();
      setFaqs((prev) => [...prev, data]);
      setNewQuestion("");
      setNewAnswer("");
    } catch (err) {
      console.error("Failed to add FAQ:", err);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    try {
      await fetch(`/api/endpoints/scouts/faqs?id=${id}`, {
        method: "DELETE",
      });
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    }
  };

  const handleSave = () => {
    router.push("/investor/studio/invite");
  };

  if (isLockLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-6 container mx-auto px-10 mt-10">
      {isLocked && (
        <div className="flex items-center gap-2 text-destructive mb-4">
          <Lock className="h-5 w-5" />
          <p className="text-sm font-medium">The scout is not in planning stage anymore</p>
        </div>
      )}
      <ScrollArea className="gap-8 h-[calc(100vh-11rem)]">
        <div className="max-w-6xl">
          <div className="space-y-4">
            <Input
              placeholder="Enter FAQ question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="h-9"
              disabled={isLocked}
            />
            <Textarea
              placeholder="Enter FAQ answer"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isLocked}
            />
          </div>

          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="text-muted-foreground text-center">
                Loading FAQs...
              </div>
            ) : faqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground bg-muted/50 rounded-[0.35rem]">
                <p>No FAQs added yet</p>
              </div>
            ) : (
              faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="space-y-2 p-4 rounded-[0.35rem] bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{faq.faqQuestion}</p>
                      <p className="text-sm text-muted-foreground">
                        {faq.faqAnswer}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      disabled={isLocked}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-center gap-2 pt-4">
            <Button
              onClick={handleAddFAQ}
              variant="secondary"
              className="rounded-[0.3rem] text-white"
              disabled={isLocked}
            >
              Add FAQ
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default FaqsContent;

