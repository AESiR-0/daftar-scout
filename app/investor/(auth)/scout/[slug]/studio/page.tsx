"use client"

import DetailsPage from "@/app/investor/(auth)/studio/details/page"
import AudiencePage from "@/app/investor/(auth)/studio/audience/page"
import FounderPitchPage from "@/app/investor/(auth)/studio/founder-pitch/page"
import InvestorPitchPage from "@/app/investor/(auth)/studio/investor-pitch/page"
import DocumentsPage from "@/app/investor/(auth)/studio/documents/page"
import FAQsPage from "@/app/investor/(auth)/studio/faqs/page"
import InvitePage from "@/app/investor/(auth)/studio/invite/page"
import SchedulePage from "@/app/investor/(auth)/studio/schedule/page"
import MeetingsPage from "@/app/investor/(auth)/studio/meetings/page"
import ApprovalPage from "@/app/investor/(auth)/studio/approval/page"
import DeletePage from "@/app/investor/(auth)/studio/delete/page"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { scoutStudioNavItems } from "@/config/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import CollaborationPage from "../../../studio/collaboration/page"

function StudioNav({ currentTab, setCurrentTab }: { currentTab: string, setCurrentTab: (tab: string) => void }) {
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    const slug = pathname.split("/")[3] // Get the scout slug from URL

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div
            className={cn(
                "sticky top-0 bg-[#0e0e0e] z-40 w-full transition-all duration-150",
                isScrolled ? "border-b backdrop-blur-sm" : ""
            )}
        >
            <div className="flex h-14 items-center px-4 border-b">
                <div className="flex items-center space-x-2">
                    <nav className="flex items-center space-x-1">
                        {scoutStudioNavItems.map((item) => {
                            return (
                                <span
                                    key={item.title}
                                    onClick={() => setCurrentTab(item.url.split("/").pop() || "details")}
                                    className={cn(
                                        "relative cursor-pointer px-3 py-2 text-sm rounded-md transition-colors",
                                        currentTab === item.url.split("/").pop()
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {item.title}
                                    {currentTab === item.url.split("/").pop() && (
                                        <span className="absolute inset-x-0 -bottom-[10px] h-[2px] bg-foreground" />
                                    )}
                                </span>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default function StudioPage() {
    const pathname = usePathname()
    const [currentTab, setCurrentTab] = useState<string>("details")
    const renderPage = () => {
        switch (currentTab) {
            case "details":
                return <DetailsPage />
            case "audience":
                return <AudiencePage />
            case "collaboration":
                return <CollaborationPage />
            case "founder-pitch":
                return <FounderPitchPage />
            case "investor-pitch":
                return <InvestorPitchPage />
            case "documents":
                return <DocumentsPage />
            case "faqs":
                return <FAQsPage />
            case "invite":
                return <InvitePage />
            case "schedule":
                return <SchedulePage />
            case "meetings":
                return <MeetingsPage />
            case "approval":
                return <ApprovalPage />
            case "delete":
                return <DeletePage />
            default:
                return <DetailsPage />
        }
    }

    return (
        <div className="flex flex-col w-full">
            <StudioNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
            <div className="flex-1">
                {renderPage()}
            </div>
        </div>
    )
}

