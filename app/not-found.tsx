"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-xl font-medium">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-[0.35rem]"
          >
            Go Back
          </Button>
          <Button
            onClick={() => router.push("/landing")}
            className="rounded-[0.35rem] bg-blue-500"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
} 