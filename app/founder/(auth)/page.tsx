"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function FounderIntroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading delay before redirect
    const timer = setTimeout(() => {
      router.push("/founder/loading");
      setIsLoading(false);
    }, 500); // Adjust delay as needed (500ms is minimal but noticeable)

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md w-full">
        <Skeleton className="h-9 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-full mx-auto" />
        <div className="p-8 rounded-lg shadow-sm">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}