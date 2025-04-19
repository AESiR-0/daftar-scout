"use client";

import { useRouter } from "next/navigation";
import { BookmarkButton } from "@/components/bookmark-button";
import { useBookmarks } from "@/lib/context/bookmark-context";
import { InvestorProfile } from "@/components/InvestorProfile";
import { ChevronRight } from "lucide-react";

interface Scout {
  id: string;
  title: string;
  postedby: string;
  status: string;
  scheduledDate: string;
  collaborator: string[];
}

export default function IncubationPage({ scouts }: { scouts: Scout[] }) {
  const router = useRouter();
  const { showBookmarked, bookmarkedSlugs, toggleBookmark } = useBookmarks();

  const filteredScouts = showBookmarked
    ? scouts.filter((scout) => bookmarkedSlugs.has(scout.id))
    : scouts;

  if (filteredScouts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <p className="text-lg text-muted-foreground">Hey, investors aren't looking at startups at the moment, but they're building a new scout. Keep checking Daftar for more opportunities</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5">
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
