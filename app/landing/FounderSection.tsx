"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"

export function FounderSection() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-16">
      {/* Hero Section */}
      <div className="space-y-4 flex flex-col items-center">
        <div className="space-y-2 text-center">
          <h1 className="text-6xl font-light">Simplifying</h1>
          <h1 className="text-6xl font-light">Investment Pitching</h1>
        <p className="py-4 text-muted-foreground text-lg">
          Video pitch your startup idea to investors and the government in 120 seconds, in any language you speak
        </p>
        </div>
      </div>

      {/* Frame and Video Section */}
      <div className="flex gap-8 items-start w-[80%] mx-auto">
        {/* Left: Image Frame */}
        <div className="flex-1 bg-muted rounded-lg overflow-hidden">
          <Image
            src="/assets/founder_layout.png"
            alt="Pitch Frame"
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Vertical Video and Label */}
        <div className="w-[300px] space-y-4">
          <div className="aspect-[9/16] max-h-[50vh] bg-muted rounded-lg overflow-hidden">
            <video
              className="w-full h-full object-cover"
              controls
              poster="/assets/torricke-barton.jpg"
            >
              <source src="/assets/torricke-barton.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="text-center">
            <p className="font-medium">built by founders</p>
            <p className="font-medium">for founders</p>
          </div>
        </div>
      </div>

      {/* Video Grid Section */}
      <div className="space-y-4">
        <h2 className="text-4xl font-light text-center">Pick Up Your Phone and <span className="text-blue-500">Pitch</span></h2>
        <p className="text-xl text-center text-muted-foreground">
          The World Will Believe in You If You Believe in Yourself.
        </p>

        {/* Video Grid */}
        <div className="w-[60%] mx-auto grid grid-cols-3 gap-4 mt-8">
          {/* First Row */}
          <div className="col-span-2 aspect-video bg-muted rounded-lg overflow-hidden">
            <video className="w-full h-full object-cover" poster="/assets/torricke-barton.jpg" controls />
          </div>
          <div className="row-span-2 aspect-[9/16] bg-muted rounded-lg overflow-hidden">
            <video className="w-full h-full object-cover" poster="/assets/torricke-barton.jpg" controls />
          </div>

          {/* Second Row */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <video className="w-full h-full object-cover" poster="/assets/torricke-barton.jpg" controls />
          </div>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <video className="w-full h-full object-cover" poster="/assets/torricke-barton.jpg" controls />
          </div>

          {/* Third Row */}
          <div className="bg-muted rounded-lg overflow-hidden">
            <video className="w-full h-full object-cover" poster="/assets/torricke-barton.jpg" controls />
          </div>
          <div className="col-span-2 aspect-video bg-muted rounded-lg overflow-hidden">
            <video className="w-full h-full object-cover" poster="/assets/torricke-barton.jpg" controls />
          </div>
        </div>
      </div>
    </div>
  )
} 