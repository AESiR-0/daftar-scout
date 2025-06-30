"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80%] bg-[#0e0e0e] text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Cross Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-6 right-6 z-50 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 shadow-lg focus:outline-none"
        aria-label="Close"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
      
      <div className="max-w-3xl mx-auto">
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-center">
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4 text-justify">
              <section className="mb-8">
                <p className="text-base md:text-lg leading-relaxed">
                  Hey Investor,
                  <br /><br />
                  We really appreciate you being part of the beta. You've got full
                  access to Daftar right now, completely free, and we're grateful for
                  your time and the feedback you've shared with us.
                  <br /><br />
                  If we ever move to a paid version, we'll make sure you have at least
                  15 days' notice. We want to give you enough time to think about how
                  it fits into your plans.
                  <br /><br />
                  We're focused on making Daftar genuinely useful, and every update
                  reflects what we've learned from you.
                  <br /><br />
                  Team Daftar OS
                </p>
              </section>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
