"use client"
import { Card, CardContent } from "@/components/ui/card"

export function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-6 min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-grow">
        <Card className="border-none">
          <CardContent className="p-6 space-y-8">
            {/* Header */}
            <h1 className="text-6xl md:text-6xl font-light text-center">
              <span className="text-blue-500">Daftar</span> Operating System
            </h1>

            {/* Subheader */}
            <p className="text-muted-foreground text-center text-lg max-w-3xl mx-auto">
              For founders pitching their startup ideas to the world and investors scouting the next big opportunity, Daftar OS is the software you can trust.
            </p>

            {/* Video Section */}
            <div className="aspect-video w-full max-w-3xl mx-auto bg-muted rounded-lg overflow-hidden">
              <video 
                className="w-full h-full object-cover"
                controls
                poster="/assets/torricke-barton.jpg"
              >
                <source src="/path-to-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Sarvodaya Text */}
            <p className="text-center text-2xl" style={{ color: "#DD00B4" }}>
              Sarvodaya
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Beta 0.1 Publish Date Feb 24, 2025. 05:30 pm
        </p>
      </footer>
    </div>
  )
}
