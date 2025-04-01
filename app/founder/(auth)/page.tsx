"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/auth";

export default function FounderIntroPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  router.push("/founder/loading");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 text-center">
        {/* Video Container */}
        {/* <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <video
            className="w-full h-full object-cover"
            src="/videos/intro.mp4"
            controls
          >
            Your browser does not support the video tag.
          </video>
        </div> */}
        {/* Text Content */}
        {/* <h1 className="text-2xl font-bold tracking-tight text-white">
          Pitch your startup story in 120 seconds
        </h1> */}

        {/* Button */}
        {/* <Button
          variant="secondary"
          size="lg"
          className="px-8 py-6 text-md"
          onClick={() => router.push("/founder/loading")}
        >
          Let&apos;s Go
        </Button> */}
      </div>
    </div>
  );
}
