"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useState } from "react"
import ReactPlayer from "react-player"

export default function FounderPage() {
  const [selectedQuestion, setSelectedQuestion] = useState("problem")
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi")

  const questions = [
    { id: "problem", title: "Introduce yourself and the problem you are solving", question: "Introduce yourself and the problem you are solving" },
    { id: "solution", title: "What are you building", question: "What are you building" },
    { id: "market", title: "Why do you really want to solve the problem", question: "Why do you really want to solve the problem" },
    { id: "business", title: "Who are your customers, and how are they dealing with this problem today", question: "Who are your customers, and how are they dealing with this problem today" },
    { id: "future", title: "Why will your customers switch from competitors to your product", question: "Why will your customers switch from competitors to your product" },
    { id: "help", title: "How will you make money", question: "How will you make money" },
    { id: "challenges", title: "What is the growth here (development, traction, or revenue), and challenges you are facing", question: "What is the growth here (development, traction, or revenue), and challenges you are facing" },

  ]

  const languages = [
    "Hindi",
    "Savji",
    "Sindhi",
    "Punjabi",
    "Gujarati",
    "Assamese",
    "Bengali",
    "English",
    "Pahadi",
    "Nepali",
    "Urdu",
    "Odia",
  ]

  const getVideoSource = (language: string, questionId: string) => {
    if (language === "Assamese" && questionId === "problem") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q1_Assamese%20-%20BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "solution") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q2_Assamese%20-%20BristyBorah.MOV"
    }
    if (language === "Assamese" && questionId === "market") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q3_Assamese%20-%20BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "business") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q4_Assamese%20-%20BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "future") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q5_Assamese%20-%20BristyBorah.MOV"
    }
    if (language === "Assamese" && questionId === "help") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q6_Assamese%20-%20BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "challenges") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q7_Assamese%20-%20BristyBorah.mov"
    }
    if (language === "Hindi" && questionId === "problem") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q2_Hindi-VanditaVerma.mp4"
    }
    if (language === "Hindi" && questionId === "solution") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q2_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "market") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q3_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "business") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q4_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "future") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q5_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "help") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q6_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "challenges") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q7_Hindi-VanditaVerma.mov"
    }
    if (language === "Punjabi" && questionId === "problem") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q1_punjabi%20-%20Manav%20Maini.mov"
    }
    if (language === "Punjabi" && questionId === "solution") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q2_punjabi%20-%20Manav%20Maini.mov"
    }
    if (language === "Punjabi" && questionId === "market") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q3_punjabi%20-%20Manav%20Maini.mov"
    }
    if (language === "Punjabi" && questionId === "business") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q4_punjabi%20-%20Manav%20Maini.mov"
    }
    if (language === "Punjabi" && questionId === "future") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q5_punjabi%20-%20Manav%20Maini.mp4"
    }
    if (language === "Punjabi" && questionId === "help") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q6_punjabi%20-%20Manav%20Maini.mov"
    }
    if (language === "Punjabi" && questionId === "challenges") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q7_punjabi%20-%20Manav%20Maini.mov"
    }
    if (language === "Sindhi" && questionId === "problem") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q1_Sindhi.mp4"
    }
    if (language === "Sindhi" && questionId === "solution") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q2_Sindhi.mp4"
    }
    if (language === "Sindhi" && questionId === "market") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q3_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === "business") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q4_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === "future") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q5_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === "help") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q6_Sindhi.mov"
    }
    if (language === "Sindhi" && questionId === "challenges") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q7_Sindhi.mov"
    }
    if (language === "Gujarati" && questionId === "problem") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q1_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "solution") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q2_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "market") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q3_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "business") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q4_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "future") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q5_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "help") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q6_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "challenges") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q7_Gujarati.mp4"
    }
    if (language === "Savji" && questionId === "problem") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q1_Savji.mp4"
    }
    if (language === "Savji" && questionId === "solution") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q2_Savji.mp4"
    }
    if (language === "Savji" && questionId === "market") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q3_Savji.mp4"
    }
    if (language === "Savji" && questionId === "business") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q4_Savji.mp4"
    }
    if (language === "Savji" && questionId === "future") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q5_Savji.mp4"
    }
    if (language === "Savji" && questionId === "help") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q6_Savji.mp4"
    }
    if (language === "Savji" && questionId === "challenges") {
      return "https://yvaoyubwynyvqfelhzcd.supabase.co/storage/v1/object/public/videos/sample-landing/Q7_Savji.mp4"
    }

    return "/videos/sample-pitch.mp4" // Default video
  }

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
                  <ReactPlayer
                    url={getVideoSource(selectedLanguage, selectedQuestion)}
                    width="100%"
                    height="100%"
                    controls
                    playing={false}
                    style={{ aspectRatio: '9/16' }}
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