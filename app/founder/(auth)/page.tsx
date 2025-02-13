"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function FounderIntroPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 text-center">
        {/* Video Container */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videos/intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Text Content */}
        <h1 className="text-xl font-bold tracking-tight text-white">
          Connecting You with Investors Who Believe in Your Startup Idea
        </h1>

        {/* Button */}
        <Button
          variant="secondary"
          size="lg"

          className="px-8 py-6 text-lg"
          onClick={() => router.push('/founder/loading')}
        >
          Let&apos;s Go
        </Button>
      </div>
    </div>
  )
}