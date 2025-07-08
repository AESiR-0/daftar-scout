"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { VideoDialog } from "@/components/dialogs/demo-dialog";
// Placeholder: Replace with your auth hook (e.g., useSession from NextAuth.js or useUser from Supabase)

export function TopNavRoot() {
  const pathname = usePathname();
  const isCloud = pathname === "/landing";
  const isPrivacy = pathname === "/privacy-policy";
  const isFounder = pathname === "/landing/founder";
  const isInvestor = pathname === "/landing/investor";
  const [demoOpen, setDemoOpen] = useState(false);
  const role = isFounder ? 'founder' : 'investor'
  // Check authentication status and user role


  // Don't show nav items on cloud page
  if (isCloud || isPrivacy) {
    return (
      <div>
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/landing" className="font-medium text-white">
              Daftar OS Technology
            </Link>
          </div>
          <div className="flex items-center space-x-4 mr-8">
            <nav className="flex items-center space-x-4">
              <Link
                href="/privacy-policy"
                className="text-sm font-medium text-muted-foreground hover:text-white ml-4"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
      </div>
    );
  }


  // Determine button text based on auth status

  return (
    <div>
      <div className="flex h-14 items-center px-4 justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/landing" className="font-medium text-white">
            Daftar OS Technology
          </Link>
        </div>

        <div className="flex items-center space-x-4 mt-4 mr-8">
          <nav className="flex items-center space-x-4">
            <Button
              onClick={() => setDemoOpen(true)}
              className="text-sm font-medium text-muted-foreground hover:text-white"
              variant="ghost"
            >
              Software Demo
            </Button>
            <Link
              href={isFounder ? "/founder/pricing" : "/investor/pricing"}
              className="text-sm font-medium text-muted-foreground hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/privacy-policy"
              className="text-sm font-medium text-muted-foreground hover:text-white ml-4"
            >
              Privacy Policy
            </Link>
          </nav>
          <Link href={`/login/${role}`}>
            <Button
              size="sm"
              className="rounded-[0.35rem] bg-blue-500 text-white hover:bg-blue-600"
            >
              Try it for free
            </Button>
          </Link>
        </div>
      </div>
      <VideoDialog open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}