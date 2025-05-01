"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { VideoDialog } from "@/components/dialogs/demo-dialog";
// Placeholder: Replace with your auth hook (e.g., useSession from NextAuth.js or useUser from Supabase)
import { useAuth } from "@/hooks/use-auth"; // Adjust to your auth library

export function TopNavRoot() {
  const pathname = usePathname();
  const isCloud = pathname === "/landing";
  const isFounder = pathname === "/landing/founder";
  const isInvestor = pathname === "/landing/investor";
  const [demoOpen, setDemoOpen] = useState(false);

  // Check authentication status and user role
  const { user, isAuthenticated } = useAuth(); // Placeholder: Adapt to your auth system
  const userRole = user?.role; // Assume role is "founder" or "investor"

  // Don't show nav items on cloud page
  if (isCloud) {
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

  // Determine home route based on auth role or pathname
  const homeRoute =
    isAuthenticated && userRole === "founder"
      ? "/founder"
      : isAuthenticated && userRole === "investor"
      ? "/investor"
      : isFounder
      ? "/login/founder"
      : "/login/investor";

  // Determine button text based on auth status
  const buttonText = isAuthenticated ? "Home" : "Try it for Free";

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
          <Link href={homeRoute}>
            <Button
              size="sm"
              className="rounded-[0.35rem] bg-blue-500 text-white hover:bg-blue-600"
            >
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>
      <VideoDialog open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}