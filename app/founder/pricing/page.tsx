"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="text-center space-y-8 max-w-3xl">
        {/* Header */}
        <h1 className="text-4xl font-bold tracking-tight">
          Pricing Coming Soon
        </h1>

        {/* Description */}
        <p className="text-xl text-muted-foreground">
          We're working on flexible pricing plans to help startups of all sizes.
          Stay tuned for updates!
        </p>

        {/* Beta Access */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">
            Get Early Access
          </h2>
          <p className="text-muted-foreground mb-6">
            Join our beta program and be the first to experience our platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/founder/login">
              <Button size="lg">
                Try Beta for Free
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Contact */}
        <p className="text-sm text-muted-foreground">
          Questions about pricing? Email us at
          <a href="mailto:contact@daftar.com" className="text-primary hover:underline">
            contact@daftar.com
          </a>
        </p>
      </div>
    </div>
  )
}
