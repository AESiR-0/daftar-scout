"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function FounderPage() {
  return (
    <div className="flex flex-col items-center h-full px-4 py-12">
      {/* Main Content */}
      <div className="max-w-6xl w-full space-y-24"> 
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-7xl font-light tracking-tight">
            Simplifying
          </h1>
          <h1 className="text-7xl font-light tracking-tight">
            Investment Pitching
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Video pitch your startup idea to investors and the government in 120 seconds, 
            <br />in any language you speak
          </p>
        </div>

        {/* Frame and Video Section */}
        <div className="relative">
          <Card className="overflow-hidden border-0 bg-muted/50 max-w-4xl mx-auto">
            <Image
              src="/assets/founder_layout.png"
              alt="Startup Scouting"
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
          </Card>
          <div className="absolute z-[-10] -top-10 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute z-[-10] -bottom-10 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
        </div>

        {/* New Bottom Section */}
        <div className="space-y-14">
          <h2 className="text-5xl font-light text-center">
            Built by Founders for Founders
          </h2>

          <div className="flex gap-2">
            {/* Left: Main Video */}
            <div className="flex-1 space-y-4 justify-end">
              <Card className="aspect-[3/4] max-h-[70vh] overflow-hidden border-0 bg-muted/50 relative group">
                <video 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                  poster="/assets/torricke-barton.jpg" 
                  controls 
                />
                <div className="absolute z-[-10] -bottom-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
              </Card>
              <p className="text-2xl text-blue-500 font-light">
                It Starts with a Dream.
              </p>
            </div>

            {/* Right: Video Grid */}
            <div className="flex-1 space-y-4 ">
              <div className="grid grid-cols-2 gap-4">
                {/* Top Row - Smaller Videos */}
                <Card className="aspect-video overflow-hidden border-0 bg-muted/50 relative group">
                  <video 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    poster="/assets/torricke-barton.jpg" 
                    controls 
                  />
                </Card>
                <Card className="aspect-video overflow-hidden border-0 bg-muted/50 relative group">
                  <video 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    poster="/assets/torricke-barton.jpg" 
                    controls 
                  />
                </Card>

                {/* Bottom Row - Larger Videos */}
                <Card className="aspect-[4/3] overflow-hidden border-0 bg-muted/50 relative group col-span-1">
                  <video 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    poster="/assets/torricke-barton.jpg" 
                    controls 
                  />
                </Card>
                <Card className="aspect-[4/3] overflow-hidden border-0 bg-muted/50 relative group col-span-1">
                  <video 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    poster="/assets/torricke-barton.jpg" 
                    controls 
                  />
                </Card>
              </div>
              <p className="text-xl text-muted-foreground text-center">
                Founders who believed in themselves
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 