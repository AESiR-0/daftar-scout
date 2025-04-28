"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookmarkButton } from "@/components/bookmark-button";
import { useBookmarks } from "@/lib/context/bookmark-context";
import { InvestorProfile } from "@/components/InvestorProfile";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Scout {
  id: string;
  title: string;
  postedby: string;
  status: string;
  scheduledDate: string;
  collaborator: string[];
}

export default function ScoutPage({ scouts }: { scouts: Scout[] }) {
  const router = useRouter();
  const { showBookmarked, bookmarkedSlugs, toggleBookmark } = useBookmarks();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate brief loading to ensure skeleton visibility
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Adjust delay as needed (500ms ensures skeleton visibility)

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  const filteredScouts = showBookmarked
    ? scouts.filter((scout) => bookmarkedSlugs.has(scout.id))
    : scouts;

  if (loading) {
    return (
      <div className="min-h-screen container mx-auto px-5 py-6">
        <div className="bg-[#1a1a1a] rounded-[0.35rem] p-6">
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between px-4 py-2 rounded-[0.35rem]">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3 bg-[#101010]" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-1/4 bg-[#101010]" />
                        <Skeleton className="h-3 w-1/5 bg-[#101010]" />
                        <Skeleton className="h-3 w-1/6 bg-[#101010]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-6 w-6 rounded-md" />
                      <Skeleton className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (filteredScouts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Hey, investors aren't looking at startups at the moment, but they're
          building a new scout. Keep checking Daftar for more opportunities
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-5 py-6">
      <div className="bg-[#1a1a1a] rounded-[0.35rem] p-6">
        <div className="space-y-4">
          {filteredScouts.map((scout) => (
            <div
              key={scout.id}
              className="group border-b border-border last:border-0 last:pb-0"
            >
              <div
                onClick={() => router.push(`/founder/scout/${scout.id}`)}
                className="flex items-center justify-between px-4 py-2 rounded-[0.35rem] transition-all duration-200 hover:bg-muted/40"
              >
                <div className="flex-1">
                  <h3 className="text-medium">{scout.title}</h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center">
                      <span className="pr-1">Collaboration: </span>
                      {scout.collaborator.map((collab, index) => (
                        <span
                          key={collab}
                          onClick={(e) => e.preventDefault()}
                        ></span>
                      ))}
                    </div>
                    <div>Last Date to Pitch: {scout.scheduledDate}</div>
                    <div>Status: {scout.status}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <BookmarkButton
                    isBookmarked={bookmarkedSlugs.has(scout.id)}
                    onToggle={() => toggleBookmark(scout.id)}
                  />
                  <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}