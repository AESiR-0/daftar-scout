"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="text-center space-y-8 max-w-3xl">
        {/* Header */}
        <h1 className="text-4xl  tracking-tight">
          Pricing for Founders
        </h1>

        {/* Description */}
        <p className="text-xl text-muted-foreground">
          Pitch your startup to top investor scouts for just ₹49 per pitch.
          Get discovered and take your venture to the next level.
        </p>

        {/* Pricing Plan */}
        <div className="bg-card p-6 rounded-lg border shadow-sm transition duration-300 hover:shadow-md hover:border-primary">
          <h2 className="text-2xl font-semibold mb-4">
            ₹49 per Pitch
          </h2>
          <p className="text-muted-foreground mb-6">
            Submit your pitch to investor's scouting programs and gain visibility among leading investors.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/founder/login">
              <Button size="lg" className="transition hover:scale-105">
                Start Pitching
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="transition hover:bg-muted hover:text-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Contact */}
        <p className="text-sm text-muted-foreground">
          Have questions? Email us at {" "} 
          <Link href="mailto:contact@daftar.com" className="text-white hover:underline hover:text-white/80 transition">
          contact@daftar.com
          </Link>
        </p>
      </div>
    </div>
  )
}
