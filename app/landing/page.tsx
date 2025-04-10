"use client"
import { Card } from "@/components/ui/card"

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center overflow-hidden min-h-[calc(100vh-3.5rem)] px-4">
            {/* Main Content */}
            <div className="max-w-5xl w-full space-y-16">
                {/* Hero Section */}
                <div className="space-y-6 text-center">
                    <h1 className="text-6xl font-light tracking-tight">
                        <span className="text-blue-500">Daftar</span> Operating System
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        For founders pitching their startup ideas to the world and investors scouting the next big opportunity,
                        Daftar OS is the software you can trust.
                    </p>
                </div>

                {/* Video Section with Sarvodaya */}
                <div className="space-y-4">
                    <div className="relative flex justify-center">
                        <Card className="aspect-video w-[80%] overflow-hidden border-0 bg-muted/50">
                            <video
                                className="w-full h-full object-cover"
                                controls
                                poster="/assets/torricke-barton.jpg"
                            >
                                <source src="/path-to-video.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </Card>

                        {/* Decorative Elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                    </div>
                    
                    {/* Sarvodaya text below video */}
                    <div className="text-left ml-[6.5rem]">
                        <p className="text-2xl font-light" style={{ color: "#DD00B4" }}>
                        The Problem Statement
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
