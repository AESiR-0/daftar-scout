"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useState } from "react"

export default function FounderPage() {
  const [selectedQuestion, setSelectedQuestion] = useState("problem")

  const questions = [
    { id: "problem", title: "Problem Statement", question: "What problem does your startup solve?" },
    { id: "solution", title: "Solution", question: "How does your solution address the problem?" },
    { id: "market", title: "Market", question: "What is your target market size?" },
    { id: "business", title: "Business Model", question: "How do you plan to make money?" }
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
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                <span className="text-sm">English</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                <span className="text-sm">Hindi</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                <span className="text-sm">Spanish</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                <span className="text-sm">French</span>
              </div>
            </div>
          </div>

          {/* Video Preview Column */}
          <div className="col-span-7">
            <Card className="overflow-hidden border-0 bg-muted/50">
              <div className="aspect-video relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-8 h-8"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Questions Column */}
          <div className="col-span-3 space-y-4">
            <h3 className="text-lg font-semibold">Key Questions</h3>
            <div className="space-y-2">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedQuestion === q.id ? 'text-blue-600 underline' : 'hover:bg-muted'
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