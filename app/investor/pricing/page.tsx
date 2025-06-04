"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PricingPage() {
  return (
    <div className="min-h-[80%] bg-[#0e0e0e] text-white py-12 px-4 sm:px-6 lg:px-8">
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
