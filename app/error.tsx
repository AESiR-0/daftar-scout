"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Oops!</h1>
          <h2 className="text-xl font-medium">Something went wrong</h2>
          <p className="text-muted-foreground">
            We apologize for the inconvenience. Please try again or return to the home page.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => reset()}
            className="rounded-[0.35rem]"
          >
            Try Again
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