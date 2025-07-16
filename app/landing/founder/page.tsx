"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import ReactPlayer from "react-player"
import { cache } from 'react';

// Move your getVideoSource logic here
const getCachedVideoSource = cache((language: string, questionId: string): string => {
  // Hindi videos
  if (language === "Hindi" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Hindi-VanditaVerma.mp4"
  }
  if (language === "Hindi" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Hindi-VanditaVerma.mp4"
  }
  if (language === "Hindi" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Hindi-VanditaVerma.mov"
  }
  if (language === "Hindi" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Hindi-VanditaVerma.mov"
  }

  // Marathi videos
  if (language === "Marathi" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Marathi.mp4"
  }
  if (language === "Marathi" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Marathi.mp4"
  }
  if (language === "Marathi" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Marathi.mp4"
  }
  if (language === "Marathi" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Marathi.mp4"
  }
  if (language === "Marathi" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Marathi.mp4"
  }
  if (language === "Marathi" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Marathi.mp4"
  }
  if (language === "Marathi" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Marathi.mp4"
  }

  // Sindhi videos
  if (language === "Sindhi" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Sindhi.mp4"
  }
  if (language === "Sindhi" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Sindhi.mp4"
  }
  if (language === "Sindhi" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Sindhi.mov"
  }
  if (language === "Sindhi" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Sindhi.mov"
  }
  if (language === "Sindhi" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Sindhi.mov"
  }
  if (language === "Sindhi" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Sindhi.mov"
  }
  if (language === "Sindhi" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Sindhi.mov"
  }

  // Assamese videos
  if (language === "Assamese" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Assamese+-+BristyBorah.mov"
  }
  if (language === "Assamese" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Assamese+-+BristyBorah.mov"
  }
  if (language === "Assamese" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Assamese+-+BristyBorah.mov"
  }
  if (language === "Assamese" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Assamese+-+BristyBorah.mov"
  }
  if (language === "Assamese" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Assamese+-+BristyBorah.mov"
  }
  if (language === "Assamese" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Assamese+-+BristyBorah.mov"
  }
  if (language === "Assamese" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Assamese+-+BristyBorah.mov"
  }

  // Punjabi videos
  if (language === "Punjabi" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_punjabi+-+Manav+Maini.mov"
  }
  if (language === "Punjabi" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_punjabi+-+Manav+Maini.mp4"
  }
  if (language === "Punjabi" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_punjabi+-+Manav+Maini.mov"
  }
  if (language === "Punjabi" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_punjabi+-+Manav+Maini.mov"
  }
  if (language === "Punjabi" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_punjabi+-+Manav+Maini.mp4"
  }
  if (language === "Punjabi" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_punjabi+-+Manav+Maini.mov"
  }
  if (language === "Punjabi" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_punjabi+-+Manav+Maini.mov"
  }

  // Gujarati videos
  if (language === "Gujarati" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Gujarati.mp4"
  }
  if (language === "Gujarati" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Gujarati.mp4"
  }

  // Bengali videos
  if (language === "Bengali" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Bengali.mp4"
  }
  if (language === "Bengali" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Bengali.mp4"
  }
  if (language === "Bengali" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Bengali.mp4"
  }
  if (language === "Bengali" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Bengali.mp4"
  }
  if (language === "Bengali" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Bengali.mp4"
  }
  if (language === "Bengali" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Bengali.mp4"
  }
  if (language === "Bengali" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Bengali.mp4"
  }

  // English videos
  if (language === "English" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_English.mp4"
  }
  if (language === "English" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_English.mp4"
  }
  if (language === "English" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_English.mp4"
  }
  if (language === "English" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_English.mp4"
  }
  if (language === "English" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_English.mp4"
  }
  if (language === "English" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_English.mp4"
  }
  if (language === "English" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_English.mp4"
  }

  // Pahadi videos
  if (language === "Pahadi" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Pahadi.mp4"
  }
  if (language === "Pahadi" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Pahadi.mp4"
  }
  if (language === "Pahadi" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Pahadi.mp4"
  }
  if (language === "Pahadi" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Pahadi.mp4"
  }
  if (language === "Pahadi" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Pahadi.mp4"
  }
  if (language === "Pahadi" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Pahadi.mp4"
  }
  if (language === "Pahadi" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Pahadi.mp4"
  }

  // Nepali videos
  if (language === "Nepali" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Nepali.mp4"
  }
  if (language === "Nepali" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Nepali.mp4"
  }
  if (language === "Nepali" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Nepali.mp4"
  }
  if (language === "Nepali" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Nepali.mp4"
  }
  if (language === "Nepali" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Nepali.mp4"
  }
  if (language === "Nepali" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Nepali.mp4"
  }
  if (language === "Nepali" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Nepali.mp4"
  }

  // Urdu videos
  if (language === "Urdu" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Urdu.mp4"
  }
  if (language === "Urdu" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Urdu.mp4"
  }
  if (language === "Urdu" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Urdu.mp4"
  }
  if (language === "Urdu" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Urdu.mp4"
  }
  if (language === "Urdu" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Urdu.mp4"
  }
  if (language === "Urdu" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Urdu.mp4"
  }
  if (language === "Urdu" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Urdu.mp4"
  }

  // Odia videos
  if (language === "Odia" && questionId === "problem") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Odia.mp4"
  }
  if (language === "Odia" && questionId === "solution") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Odia.mp4"
  }
  if (language === "Odia" && questionId === "market") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Odia.mp4"
  }
  if (language === "Odia" && questionId === "business") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Odia.mp4"
  }
  if (language === "Odia" && questionId === "future") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Odia.mp4"
  }
  if (language === "Odia" && questionId === "help") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Odia.mp4"
  }
  if (language === "Odia" && questionId === "challenges") {
    return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Odia.mp4"
  }

  return "/videos/sample-pitch.mp4"; // Default video
});

export default function FounderPage() {
  const [selectedQuestion, setSelectedQuestion] = useState("problem")
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi")
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const playerRef = useRef<ReactPlayer | null>(null);
  const MAX_LENGTH = 20;
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setPlayedSeconds(0);
    setIsPlaying(false);
    if (playerRef.current) {
      playerRef.current.seekTo(0, "seconds");
    }
  }, [selectedLanguage, selectedQuestion]);

  useEffect(() => {
    if (playedSeconds >= MAX_LENGTH && isPlaying) {
      setIsPlaying(false);
      if (playerRef.current) {
        playerRef.current.seekTo(MAX_LENGTH, "seconds");
      }
    }
  }, [playedSeconds, isPlaying]);

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
    "Marathi",
    "Sindhi",
    "Assamese",
    "Punjabi",

  ]

  const getVideoSource = (language: string, questionId: string) => {
    // Hindi videos
    if (language === "Hindi" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Hindi-VanditaVerma.mov"
    }
    if (language === "Hindi" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Hindi-VanditaVerma.mov"
    }

    // Marathi videos
    if (language === "Marathi" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Marathi.mp4"
    }
    if (language === "Marathi" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Marathi.mp4"
    }
    if (language === "Marathi" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Marathi.mp4"
    }
    if (language === "Marathi" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Marathi.mp4"
    }
    if (language === "Marathi" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Marathi.mp4"
    }
    if (language === "Marathi" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Marathi.mp4"
    }
    if (language === "Marathi" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Marathi.mp4"
    }

    // Sindhi videos
    if (language === "Sindhi" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Sindhi.mp4"
    }
    if (language === "Sindhi" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Sindhi.mp4"
    }
    if (language === "Sindhi" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Sindhi.mp4"
    }
    if (language === "Sindhi" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Sindhi.mp4"
    }
    if (language === "Sindhi" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Sindhi.mp4"
    }
    if (language === "Sindhi" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Sindhi.mp4"
    }
    if (language === "Sindhi" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Sindhi.mp4"
    }

    // Assamese videos
    if (language === "Assamese" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Assamese+-+BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Assamese+-+BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Assamese+-+BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Assamese+-+BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Assamese+-+BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Assamese+-+BristyBorah.mov"
    }
    if (language === "Assamese" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Assamese+-+BristyBorah.mov"
    }

    // Punjabi videos
    if (language === "Punjabi" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_punjabi+-+Manav+Maini.mov"
    }
    if (language === "Punjabi" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_punjabi+-+Manav+Maini.mov"
    }
    if (language === "Punjabi" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_punjabi+-+Manav+Maini.mov"
    }
    if (language === "Punjabi" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_punjabi+-+Manav+Maini.mov"
    }
    if (language === "Punjabi" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_punjabi+-+Manav+Maini.mov"
    }
    if (language === "Punjabi" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_punjabi+-+Manav+Maini.mov"
    }
    if (language === "Punjabi" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_punjabi+-+Manav+Maini.mov"
    }

    // Gujarati videos
    if (language === "Gujarati" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Gujarati.mp4"
    }
    if (language === "Gujarati" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Gujarati.mp4"
    }

    // Bengali videos
    if (language === "Bengali" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Bengali.mp4"
    }
    if (language === "Bengali" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Bengali.mp4"
    }
    if (language === "Bengali" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Bengali.mp4"
    }
    if (language === "Bengali" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Bengali.mp4"
    }
    if (language === "Bengali" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Bengali.mp4"
    }
    if (language === "Bengali" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Bengali.mp4"
    }
    if (language === "Bengali" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Bengali.mp4"
    }

    // English videos
    if (language === "English" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_English.mp4"
    }
    if (language === "English" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_English.mp4"
    }
    if (language === "English" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_English.mp4"
    }
    if (language === "English" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_English.mp4"
    }
    if (language === "English" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_English.mp4"
    }
    if (language === "English" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_English.mp4"
    }
    if (language === "English" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_English.mp4"
    }

    // Pahadi videos
    if (language === "Pahadi" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Pahadi.mp4"
    }
    if (language === "Pahadi" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Pahadi.mp4"
    }
    if (language === "Pahadi" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Pahadi.mp4"
    }
    if (language === "Pahadi" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Pahadi.mp4"
    }
    if (language === "Pahadi" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Pahadi.mp4"
    }
    if (language === "Pahadi" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Pahadi.mp4"
    }
    if (language === "Pahadi" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Pahadi.mp4"
    }

    // Nepali videos
    if (language === "Nepali" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Nepali.mp4"
    }
    if (language === "Nepali" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Nepali.mp4"
    }
    if (language === "Nepali" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Nepali.mp4"
    }
    if (language === "Nepali" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Nepali.mp4"
    }
    if (language === "Nepali" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Nepali.mp4"
    }
    if (language === "Nepali" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Nepali.mp4"
    }
    if (language === "Nepali" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Nepali.mp4"
    }

    // Urdu videos
    if (language === "Urdu" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Urdu.mp4"
    }
    if (language === "Urdu" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Urdu.mp4"
    }
    if (language === "Urdu" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Urdu.mp4"
    }
    if (language === "Urdu" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Urdu.mp4"
    }
    if (language === "Urdu" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Urdu.mp4"
    }
    if (language === "Urdu" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Urdu.mp4"
    }
    if (language === "Urdu" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Urdu.mp4"
    }

    // Odia videos
    if (language === "Odia" && questionId === "problem") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q1_Odia.mp4"
    }
    if (language === "Odia" && questionId === "solution") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q2_Odia.mp4"
    }
    if (language === "Odia" && questionId === "market") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q3_Odia.mp4"
    }
    if (language === "Odia" && questionId === "business") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q4_Odia.mp4"
    }
    if (language === "Odia" && questionId === "future") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q5_Odia.mp4"
    }
    if (language === "Odia" && questionId === "help") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q6_Odia.mp4"
    }
    if (language === "Odia" && questionId === "challenges") {
      return "https://d2nq6gsuamvat4.cloudfront.net/sample-landing/Q7_Odia.mp4"
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
            Pitch your startup idea to investors in 2.5 mins, in the language <br /> you are most comfortable with
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
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedLanguage === language ? 'text-blue-600' : 'hover:bg-muted'
                      }`}
                    onClick={() => setSelectedLanguage(language)}
                  >
                    <span className="text-sm">{language}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Preview Column with custom controls */}
            <div className="col-span-6">
              <Card className="overflow-hidden border-0 ">
                <div
                  className="aspect-[9/16] max-h-[700px] w-full flex flex-col items-center justify-center relative"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onTouchStart={() => setIsHovered(true)} // for mobile
                >
                  {/* Preload video for caching */}
                  <video
                    src={getCachedVideoSource(selectedLanguage, selectedQuestion)}
                    preload="auto"
                    style={{ display: "none" }}
                  />
                  <ReactPlayer
                    ref={playerRef}
                    url={getCachedVideoSource(selectedLanguage, selectedQuestion)}
                    width="100%"
                    height="100%"
                    controls={false}
                    playing={isPlaying}
                    onProgress={({ playedSeconds }) => {
                      setPlayedSeconds(playedSeconds);
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    progressInterval={200}
                    style={{ aspectRatio: '9/16' }}
                  />
                  {/* Play/Pause button overlay logic */}
                  {(!isPlaying) && (
                    <button
                      onClick={() => {
                        if (playedSeconds >= MAX_LENGTH) {
                          playerRef.current?.seekTo(0, "seconds");
                          setPlayedSeconds(0);
                        }
                        setIsPlaying(true);
                      }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 rounded-full p-4 text-white text-3xl focus:outline-none"
                      style={{ zIndex: 10 }}
                    >
                      {/* Play icon */}
                      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                    </button>
                  )}
                  {(isPlaying && isHovered) && (
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 rounded-full p-4 text-white text-3xl focus:outline-none"
                      style={{ zIndex: 10 }}
                    >
                      {/* Pause icon */}
                      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    </button>
                  )}
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
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedQuestion === q.id ? 'text-blue-600' : 'hover:bg-muted'
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