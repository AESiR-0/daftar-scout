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
            in any language you speak
          </p>
        </div>

        {/* Frame and Video Section */}
        <div className="flex gap-12 items-start mb-20 justify-center">
          {/* Left: Image Frame */}
          <div className="relative flex-1 max-w-2xl">
            <Card className="overflow-hidden border-0 bg-muted/50">
              <Image
                src="/assets/founder_layout.png"
                alt="Pitch Frame"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </Card>
            <div className="absolute z-[-10] -top-4 -right-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          </div>

          {/* Right: Vertical Video */}
          <div className="w-[300px] space-y-6">
            <div className="relative">
              <Card className="aspect-[4/3] overflow-hidden border-0 bg-muted/50">
                <video
                  className="w-full h-full object-cover"
                  controls
                  poster="/assets/torricke-barton.jpg"
                >
                  <source src="/assets/torricke-barton.mp4" type="video/mp4" />
                </video>
              </Card>
              <div className="absolute z-[-10] -bottom-4 -left-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
            </div>
            <div className="text-left space-y-1">
              <p className="font-medium">built by founders</p>
              <p className="font-medium">for founders</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-8  text-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-light">
              Pick Up Your Phone and <span className="text-blue-500">Pitch</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              The World Will Believe in You If You Believe in Yourself.
            </p>
          </div>

          {/* Video Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 mt-12">
            {/* First Row */}
            <Card className="col-span-2 aspect-video overflow-hidden border-0 bg-muted/50 relative group">
              <video 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                poster="/assets/torricke-barton.jpg" 
                controls 
              />
              <div className="absolute z-[-10] -bottom-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            </Card>
            <Card className="row-span-2 aspect-[9/16] overflow-hidden border-0 bg-muted/50 relative group">
              <video 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                poster="/assets/torricke-barton.jpg" 
                controls 
              />
              <div className="absolute z-[-10] -top-4 -left-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
            </Card>

            {/* Second Row */}
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

            {/* Third Row */}
            <Card className="overflow-hidden border-0 bg-muted/50 relative group">
              <video 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                poster="/assets/torricke-barton.jpg" 
                controls 
              />
              <div className="absolute z-[-10] -bottom-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            </Card>
            <Card className="col-span-2 aspect-video overflow-hidden border-0 bg-muted/50 relative group">
              <video 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                poster="/assets/torricke-barton.jpg" 
                controls 
              />
              <div className="absolute z-[-10] -top-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 