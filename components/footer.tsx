"use client"
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isLandingPage = pathname?.startsWith("/landing");

    return (
      <footer className="py-6 bg-[#0e0e0e]  text-center">
        <p className="text-sm text-muted-foreground">
         You are on Beta 1.0
        </p>
      </footer>
    );

  // return (
  //   <footer className="border-t w-full py-4 bg-[#0e0e0e] h-[10%]">
  //     <div className="flex items-center justify-center">
  //       <p className="text-center text-sm leading-loose text-muted-foreground">
  //       Designed and Built by Daftar OS Technology
  //       </p>
  //     </div>
  //   </footer>
  // );
} 