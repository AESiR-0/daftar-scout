"use client"

import { useState } from "react"
import { TopNavRoot } from "@/components/navbar/top-nav-root"
import { LandingPage } from "./landing/landingPage"
import { FounderSection } from "./landing/FounderSection"
import { InvestorSection } from "./landing/InvestorSection"
import { RootSidebar } from "@/components/navbar/root-sidebar"

type TabType = "cloud" | "founder" | "investor"

export default function RootPage() {
  const [activeTab, setActiveTab] = useState<TabType>("cloud")

  const renderContent = () => {
    switch (activeTab) {
      case "founder":
        return <FounderSection />
      case "investor":
        return <InvestorSection />
      default:
        return <LandingPage />
    }
  }

  return (
    <div className="flex h-screen">
      <RootSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <TopNavRoot />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
