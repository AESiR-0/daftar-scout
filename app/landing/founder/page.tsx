"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useState } from "react"

export default function FounderPage() {
  const [selectedQuestion, setSelectedQuestion] = useState("problem")

  const questions = [
    { id: "problem", title: "Introduce yourself", question: "Introduce yourself" },
    { id: "solution", title: "How did you come up with the idea ", question: "How did you come up with the idea " },
    { id: "market", title: "What is the problem are you solving, and why is it really important for you to solve it", question: "What is the problem are you solving, and why is it really important for you to solve it" },
    { id: "business", title: "Who are your customers, and why would they pay for it", question: "Who are your customers, and why would they pay for it" },
    { id: "future", title: "How much have you worked on your startup, and where do you see it in 3 years", question: "How much have you worked on your startup, and where do you see it in 3 years" },
    { id: "help", title: "What challenges are you facing, and what support do you need", question: "What challenges are you facing, and what support do you need" },
  ]

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

        {/* 3 Column Layout */}
        <div className="grid grid-cols-12 gap-6 mt-24">
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
                    selectedQuestion === q.id ? 'bg-blue-600 text-white' : 'hover:bg-muted'
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
  )
} 