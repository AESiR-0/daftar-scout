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
    <footer className="border-t w-full py-4 bg-[#0e0e0e] h-[10%]">
      <div className="flex items-center justify-center">
        <p className="text-center text-sm leading-loose text-muted-foreground">
        Designed and Built by Daftar OS Technology
        </p>
      </div>
    </footer>
  );
} 