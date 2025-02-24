"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState("one-time");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
      <div className="text-center space-y-6 max-w-4xl">
        {/* Header */}
        <h1 className="text-5xl  tracking-tight">
          Pricing Plans for Investors
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Launch your own scout program or upgrade to Elite Daftar for premium investor collaboration.
        </p>

        {/* Tabs for Pricing Plans */}
        <Tabs defaultValue="one-time" className="w-full max-w-2xl mx-auto mt-6">
          <TabsList className="grid grid-cols-3 w-full bg-card p-1 rounded-lg shadow">
            <TabsTrigger value="one-time" onClick={() => setActiveTab("one-time")} className="w-full">
              One-Time
            </TabsTrigger>
            <TabsTrigger value="monthly" onClick={() => setActiveTab("monthly")} className="w-full">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" onClick={() => setActiveTab("yearly")} className="w-full">
              Yearly
            </TabsTrigger>
          </TabsList>

          {/* One-Time Plan */}
          <TabsContent value="one-time" className="mt-6">
            <div className="bg-card p-8 rounded-xl border shadow-md hover:shadow-lg transition">
              <h2 className="text-3xl font-semibold mb-3 ">
                Create a Scout
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Start your scouting program and discover high-potential startups.
              </p>
              <p className="text-2xl font-bold text-foreground mb-6">₹299 one-time</p>
              <Link href="/investor/login">
                <Button variant="secondary" size="lg" className="w-full transition hover:scale-105">
                  Start Scouting
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Monthly Plan */}
          <TabsContent value="monthly" className="mt-6">
            <div className="bg-primary text-white p-8 rounded-xl border shadow-md hover:shadow-lg transition relative">
              <h2 className="text-3xl font-semibold mb-3">Elite Daftar</h2>
              <p className="text-white/90 mb-6 text-lg">
                Collaborate with top investors and expand your scouting network.
              </p>
              <p className="text-2xl font-bold mb-6">₹499/month</p>
              <Link href="/investor/login">
                <Button size="lg" variant="secondary" className="w-full transition hover:scale-105">
                  Upgrade to Elite
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Yearly Plan */}
          <TabsContent value="yearly" className="mt-6">
            <div className="bg-primary text-white p-8 rounded-xl border shadow-md hover:shadow-lg transition relative">
              <h2 className="text-3xl font-semibold mb-3">Elite Daftar (Yearly)</h2>
              <p className="text-white/90 mb-6 text-lg">
                Get a full-year subscription and maximize your investor collaboration.
              </p>
              <p className="text-2xl font-bold mb-6">₹4999/year</p>
              <Link href="/investor/login">
                <Button size="lg" variant="secondary" className="w-full transition hover:scale-105">
                  Upgrade to Elite
                </Button>
              </Link>
              
              {/* Best Value Badge */}
              <span className="absolute top-3 right-3 bg-white text-primary text-xs font-bold px-3 py-1 rounded-full shadow">
                Best Value
              </span>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact */}
        <p className="text-sm text-muted-foreground mt-8">
          Have questions? Email us at{" "}
          <a href="mailto:contact@daftar.com" className=" font-medium hover:underline transition">
            contact@daftar.com
          </a>
        </p>
      </div>
    </div>
  );
}
