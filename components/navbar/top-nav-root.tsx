"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { VideoDialog } from "@/components/dialogs/demo-dialog"

export function TopNavRoot() {
    const pathname = usePathname()
    const isCloud = pathname === "/landing"
    const isFounder = pathname === "/landing/founder"
    const isInvestor = pathname === "/landing/investor"
    const [demoOpen, setDemoOpen] = useState(false)

    // Don't show nav items on cloud page
    if (isCloud) {
        return (
            <div>
                <div className="flex h-14 items-center px-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/landing" className="font-medium">
                            Daftar OS Technology
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex h-14 items-center px-4 justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/landing" className="font-medium">
                        Daftar OS Technology
                    </Link>
                </div>

                <div className="flex items-center space-x-4 mt-4 mr-8">
                    <nav className="flex items-center">
                        <Button onClick={() => setDemoOpen(true)} className="text-sm font-medium text-muted-foreground hover:text-white">
                            Software Demo
                        </Button>
                        <Link href={isFounder ? "/founder/pricing" : '/investor/pricing'} className="text-sm font-medium text-muted-foreground hover:text-white">
                            Pricing
                        </Link>
                    </nav>
                        {/* <Link href={isFounder ? "/login/founder" : "/login/investor"}>
                            <Button variant="outline" size="sm" className="rounded-[0.35rem]">
                                Sign Up
                            </Button>
                        </Link> */}
                        <Link href={isFounder ? "/login/founder" : "/login/investor"}>
                            <Button size="sm" className="rounded-[0.35rem] bg-blue-500 text-white hover:bg-blue-600">
                                Try it for Free
                            </Button>
                        </Link>
                </div>
            </div>
            <VideoDialog
                open={demoOpen}
                onOpenChange={setDemoOpen}
            />
        </div>
    )
} 