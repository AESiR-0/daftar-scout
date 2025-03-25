"use client"
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isLandingPage = pathname?.startsWith("/landing");

  if (isLandingPage) {
    return (
      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Beta 0.1 Publish Date Feb 24, 2025. 05:30 pm
        </p>
      </footer>
    );
  }

  return (
    <footer className="border-t w-full py-6 md:px-8 md:py-0 bg-[#0e0e0e] h-[8vh]">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground">
        Designed and Built by Daftar OS Technology
        </p>
      </div>
    </footer>
  );
} 