"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Scroll } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type StoryTab = "economy" | "case-studies";

interface CaseStudy {
  title: string;
  subtitle: string;
  content: string;
  investment: string;
  source: string;
}

interface EconomyStory {
  title: string;
  content: string;
  hasVideo: boolean;
  video: string;
  image: string;
}

interface CaseStudiesStory {
  title: string;
  studies: CaseStudy[];
}

type Story = EconomyStory | CaseStudiesStory;

const stories: Record<StoryTab, Story> = {
  economy: {
    title: "Backing Tomorrow, Today",
    content: "",
    hasVideo: true,
    video: "/assets/economy.mp4",
    image: "/assets/economy.png",
  },
  "case-studies": {
    title: "Case Studies",
    studies: [
      {
        title: "Pitambari",
        subtitle: "India. FMCG.",
        content: `Sudhir Joshi started Pitambari in Thane, Maharashtra, with a single product: a metal polish for brass and copper utensils. Over time, Pitambari expanded into household care, Ayurveda, and FMCG products, competing with giants like Unilever and P&G. As of FY 2022, Pitambari reported revenues of approximately $40 million.`,
        investment:
          "A $50K investment for 5% could be worth $10–$20 million today.",
        source: "Source",
      },
      {
        title: "Cycle Agarbatti",
        subtitle: "India. Consumer Goods.",
        content: `N. Ranga Rao started Cycle Agarbatti in Mysuru, Karnataka, focusing on quality and strategic marketing. Today, Cycle Agarbatti is India's leading agarbatti brand, selling in over 75 countries and valued at $251 million.`,
        investment:
          "A $50K investment for 5% could be worth $20–$50 million today.",
        source: "Source",
      },
      {
        title: "Pet Saffa",
        subtitle: "India. Healthcare.",
        content: `Aimil Pharmaceuticals launched Pet Saffa in Delhi as a small Ayurvedic digestive brand. With the right product and product availability, i.e., distribution, today, Pet Saffa is a market leader, valued at $50 million–$100 million.`,
        investment:
          "A $50K investment for 5% could be worth $5–$10 million today.",
        source: "Source",
      },
      {
        title: "Tally Solutions",
        subtitle: "India. Technology.",
        content: `Bharat Goenka started Tally Solutions in Bengaluru, Karnataka, with a simple idea: to help small businesses manage accounts easily. Today, Tally Solutions is India's top accounting software, used by over 7 million businesses and valued between $500 million and $1 billion.`,
        investment:
          "A $50K investment for 5% could be worth $50–$100 million today.",
        source: "Source",
      },
      {
        title: "Nirma",
        subtitle: "India. FMCG.",
        content: `Karsanbhai Patel started Nirma in Ahmedabad, Gujarat, literally selling detergent door-to-door. Today, Nirma is valued between $1 billion and $2 billion.`,
        investment:
          "A $50K investment for 5% could be worth $100–$200 million today.",
        source: "Source",
      },
      {
        title: "Amrutanjan Healthcare",
        subtitle: "India. Healthcare.",
        content: `Kasinathuni Nageswara Rao created Amrutanjan Healthcare in Chennai, Tamil Nadu, selling a pain balm that worked. Today, Amrutanjan Healthcare is a major player in healthcare, with a market capitalization of $270 million.`,
        investment:
          "A $50K investment for 5% could be worth $27 million today.",
        source: "Source",
      },
      {
        title: "Rajdhani Besan",
        subtitle: "India. Food & Beverages.",
        content: `Raj Kumar Gupta started Rajdhani Besan in Delhi, selling flour and pulses locally in an unstructured market. Today, Rajdhani Besan is a major brand valued between $100 million and $200 million.`,
        investment:
          "A $50K investment for 5% could be worth $10–$20 million today.",
        source: "Source",
      },
      {
        title: "Jaipur Rugs",
        subtitle: "India. Textiles & Handicrafts.",
        content: `Nand Kishore Chaudhary started Jaipur Rugs in Rajasthan with a handful of small-town weavers. Today, Jaipur Rugs connects 40,000 artisans to global markets and is valued at approximately $200 million.`,
        investment:
          "A $50K investment for 5% could be worth $10–$20 million today.",
        source: "Source",
      },
      {
        title: "Arvind Mills",
        subtitle: "India. Fashion & Textiles.",
        content: `Narottam Lalbhai started Arvind Mills in Ahmedabad, Gujarat, built the world's biggest denim factory, and supplied brands like Levi's, Gap, and Tommy Hilfiger. Today, Arvind Mills is valued at $1 billion.`,
        investment:
          "A $50K investment for 5% could be worth $100 million today.",
        source: "Source",
      },
    ],
  },
};

export default function InvestorPage() {
  const [activeStory, setActiveStory] = useState<StoryTab>("economy");

  const renderContent = () => {
    const story = stories[activeStory];

    if (activeStory === "economy") {
      return (
        <div className=" aspect-video  max-h-[65vh] bg-muted rounded-sm overflow-hidden mx-auto">
          <video
            className="w-full h-full object-cover rounded-sm"
            controls
            poster="/assets/torricke-barton.jpg"
          >
            <source src="/assets/torricke-barton.mp4" type="video/mp4" />
          </video>
        </div>
      );
    }

    const caseStudiesStory = story as CaseStudiesStory;
    return (
      <div className="space-y-12">
        {caseStudiesStory.studies.map((study: CaseStudy, index: number) => (
          <article
            key={index}
            className="space-y-2 border-b border-black/20 pb-8"
          >
            <h2 className="text-2xl font-serif font-bold leading-tight">
              {study.title}
            </h2>
            <div className="flex items-center space-x-2 text-sm font-serif text-black/70">
              <span>{study.subtitle}</span>
            </div>
            <div className="my-4">
              <p className="text-lg font-serif leading-relaxed">
                {study.content}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-serif text-black/70">
                {study.investment}
              </p>
              <span className="text-sm text-black/70 italic">
                {study.source}
              </span>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-3.5rem)] px-4 py-12">
      {/* Main Content */}
      <div className="max-w-6xl w-full space-y-16">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-7xl font-light tracking-tight">
            Startup Scouting, Simplified
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Feel the 'why' behind a founder's problem statement in the language
            they are comfortable to speak, coz a pitch deck isn't enough
          </p>
        </div>

        {/* Image Frame */}
        <div className="relative">
          <Card className="overflow-hidden border-0 bg-muted/50 max-w-4xl mx-auto">
            <Image
              src="/assets/investor_layout.png"
              alt="Startup Scouting"
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
          </Card>
          <div className="absolute z-[-10] -top-10 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute z-[-10] -bottom-10 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
        </div>

        {/* Bottom Section */}
        <div className="space-y-6 text-center">
          <h2 className="text-4xl font-light">
            Be the first to scout the next big startup
          </h2>
        </div>

        {/* Newspaper Section */}
        <Card className="bg-[#f4f1ea] text-black p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-4 gap-8">
            {/* Left Column - Navigation */}
            <div className="space-y-6">
              <div className="space-y-3 font-serif">
                {Object.entries(stories).map(([key, story]) => (
                  <button
                    key={key}
                    onClick={() => setActiveStory(key as StoryTab)}
                    className={cn(
                      "text-left w-full py-1 transition-colors text-sm font-serif border-b border-black/20",
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

            <div className="col-span-3 border-l border-black ">
              <ScrollArea className="h-[calc(100vh-12rem)] pl-8 px-12 overflow-hidden">
                {renderContent()}
              </ScrollArea>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
