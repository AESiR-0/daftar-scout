"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useState } from "react"

export default function FounderPage() {
  const [selectedQuestion, setSelectedQuestion] = useState("problem")
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi")

  const questions = [
    { id: "problem", title: "Introduce yourself", question: "Introduce yourself" },
    { id: "solution", title: "How did you come up with the idea ", question: "How did you come up with the idea " },
    { id: "market", title: "What is the problem are you solving, and why is it really important for you to solve it", question: "What is the problem are you solving, and why is it really important for you to solve it" },
    { id: "business", title: "Who are your customers, and why would they pay for it", question: "Who are your customers, and why would they pay for it" },
    { id: "future", title: "How much have you worked on your startup, and where do you see it in 3 years", question: "How much have you worked on your startup, and where do you see it in 3 years" },
    { id: "help", title: "What challenges are you facing, and what support do you need", question: "What challenges are you facing, and what support do you need" },
  ]

  const languages = [
    "Hindi",
    "Kannada",
    "Bengali",
    "Pahadi",
    "Nepali",
    "Assamese",
    "Gujarati",
    "English",
    "Sindhi",
    "Punjabi",
    "Urdu",
    "Odia",
  ]

  return (
    <div className="flex flex-col items-center h-full px-4 py-12">
      {/* Main Content */}
      <div className="max-w-6xl w-full mt-10 space-y-28"> 
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-7xl font-light tracking-tight">
            Startup Pitching, Simplified
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Pitch your startup idea to investors in 2.5 mins, in the language <br/> you are most comfortable with
          </p>
        </div>

        {/* Frame and Video Section */}
        <div>
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
        <div className="text-left">
          <h1 className="text-3xl font-semibold">Sample Startup Pitches</h1>
        
          {/* 3 Column Layout */}
          <div className="grid grid-cols-12 gap-6 mt-10">
            {/* Language Column */}
            <div className="col-span-2 space-y-4">
              <h3 className="text-lg font-semibold">Languages</h3>
              <div className="space-y-2">
                {languages.map((language) => (
                  <div
                    key={language}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedLanguage === language ? 'text-blue-600' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedLanguage(language)}
                  >
                    <span className="text-sm">{language}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Preview Column */}
            <div className="col-span-6">
              <Card className="overflow-hidden border-0 bg-muted/50">
                <div className="aspect-[9/16] max-h-[700px] w-full flex items-center justify-center">
                  <video
                    src="/videos/sample-pitch.mp4" // Placeholder; replace with actual video
                    poster="/assets/video-poster.jpg" // Optional poster image
                    controls
                    className="w-full h-full object-cover rounded-[0.35rem]"
                  />
                </div>
              </Card>
            </div>

            {/* Questions Column */}
            <div className="col-span-4 space-y-4">
              <h3 className="text-lg font-semibold">Investor's Questions</h3>
              <div className="space-y-2">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedQuestion === q.id ? 'text-blue-600' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedQuestion(q.id)}
                  >
                    <span className="text-sm">{q.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}