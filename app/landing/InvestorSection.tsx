"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { cn } from "@/lib/utils"

type StoryTab = "economy" | "induben" | "signal" | "dabba" | "lijjat"

const stories = {
  economy: {
    title: "New Startup Economy",
    content: "",
    hasVideo: true,
    video: "/assets/economy.mp4",
    image: "/assets/economy.png",
  },
  induben: {
    title: "Induben Khakhrawala",
    content: `If Induben Khakrawala had received investment similar to GoMechanic, the potential for returns would have been substantial. For context, GoMechanic raised funding in multiple rounds, including a Series C funding of $42 million in 2021, which helped them scale their operations across cities and build a brand in the automotive repair industry.

Assuming Induben Khakrawala had received an investment of similar magnitude—say, $10 million in the early stages—and leveraged that capital for expansion and marketing, we could estimate a similar growth trajectory. 

GoMechanic, for instance, saw significant growth in revenue, reaching over ₹100 crores in annual revenue in just a few years post-investment. 

If Induben Khakrawala had scaled nationally, improved its operations, and entered new markets, it could have easily seen a 5-10x return on investment in the same time frame.`,
    image: "/assets/induben.png",
  },
  signal: {
    title: "Signal Vadapav",
    content: "How a small vadapav stall outside Mithibai College turned into Mumbai's iconic food chain.",
    image: "/assets/signal.png",
  },
  dabba: {
    title: "Mumbai Dabbawalas",
    content: "A Six Sigma certified organization that delivers 200,000 lunch boxes daily with 99.99% accuracy.",
    image: "/assets/dabba.png",
  },
  lijjat: {
    title: "Lijjat Papad",
    content: "Seven women with ₹80 built a ₹1600 Cr organization, empowering thousands of women entrepreneurs.",
    image: "/assets/lijjat_papad.png",
  },
}

export function InvestorSection() {
  const [activeStory, setActiveStory] = useState<StoryTab>("economy")

  const renderContent = () => {
    const story = stories[activeStory]
    
    if (activeStory === "economy") {
      return (
        <div className="aspect-[9/16] max-h-[70vh] bg-muted rounded-sm overflow-hidden max-w-sm mx-auto">
          <video
            className="w-full h-full object-cover"
            controls
            poster="/assets/torricke-barton.jpg"
          >
            <source src="/assets/torricke-barton.mp4" type="video/mp4" />
          </video>
        </div>
      )
    }

    return (
      <article className="space-y-4">
        <h1 className="text-3xl font-serif font-bold leading-tight">
          {story.title}
        </h1>
        <div className="flex items-center space-x-2 text-xs font-serif text-black/70">
          <span>By Special Correspondent</span>
          <span>•</span>
          <span>Mumbai, India</span>
        </div>
        {story.image && (
          <div className="my-4">
            <Image
              src={story.image}
              alt={story.title}
              width={600}
              height={400}
              className="w-full rounded-sm"
            />
            <p className="text-xs text-black/70 mt-2 font-serif italic">
              {story.title} - A story of missed opportunity
            </p>
          </div>
        )}
        <div className="border-t border-b border-black/20 my-4 py-4">
          <p className="text-lg font-serif leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
            {story.content}
          </p>
        </div>
      </article>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-16">
      {/* Hero Section */}
      <div className="space-y-4 flex flex-col items-center text-center">
        <div className="space-y-2">
          <h1 className="text-6xl font-light">Simplifying</h1>
          <h1 className="text-6xl font-light">Startup Scouting</h1>
        <p className="text-muted-foreground text-lg py-4">
          Feel the 'why' behind a founder's problem statement in the language they are comfortable to speak, coz a pitch deck isn't enough
        </p>
        </div>
      </div>

      {/* Image Frame */}
      <div className="bg-muted rounded-lg overflow-hidden max-w-4xl mx-auto">
        <Image
          src="/assets/investor_layout.png"
          alt="Startup Scouting"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Missed Opportunities Section */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light">
          You've <span className="text-blue-500">Missed</span> Billion-Dollar Opportunities
        </h2>
      </div>

      {/* Newspaper Style Card */}
      <Card className="bg-[#f4f1ea] text-black p-8 max-w-5xl min-h-[100vh] mx-auto shadow-md">
        <div className="border-b-2 border-black pb-4 mb-8">
          <h3 className="text-4xl font-serif text-center tracking-tight">
            THE STARTUP HERALD
          </h3>
          <div className="flex justify-between text-xs mt-2 font-serif">
            <span>Est. 2024</span>
            <span>Vol. 1 No. 1</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Navigation */}
          <div className="space-y-6">
            <div className="space-y-3 font-serif">
              {Object.entries(stories).map(([key, story]) => (
                <button
                  key={key}
                  onClick={() => setActiveStory(key as StoryTab)}
                  className={cn(
                    "text-left w-full py-1 transition-colors font-serif border-b border-black/20",
                    activeStory === key 
                      ? "text-black font-bold" 
                      : "text-black/70 hover:text-black"
                  )}
                >
                  {story.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="col-span-2 border-l border-black pl-8">
            {renderContent()}
          </div>
        </div>
      </Card>
    </div>
  )
} 