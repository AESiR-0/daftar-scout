"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function FounderIntroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, update } = useSession();

  useEffect(() => {
    if (session?.status !== 'authenticated') {
      console.log(session?.idToken);
      async function getUserId() {
        try {
          const response = await fetch(`http://127.0.0.1:8000/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: session?.idToken,
              user_type: "founder",
            }),
          });
          const data = await response.json();
          if (data.email) {
            update({ status: 'authenticated' });
            console.log(data);
            if (session) {
              session.accessToken = data.accessToken as string;
              setIsLoading(false);
            }
          } else {
            update({ ...session, status: 'unauthenticated' });
            console.error("Failed to fetch access token");
            setIsLoading(false);
            // router.push('/login/founder')
          }
        } catch (error) {
          console.error("Error fetching access token:", error);
          setIsLoading(false);
        }
      }
      getUserId();
    } else {
      setIsLoading(false);
    }
  }, [session, update]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 text-center">
        {/* Video Container */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <video
            className="w-full h-full object-cover"
            src="/videos/intro.mp4"
            controls
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Pitch your startup story in 120 seconds
        </h1>

        {/* Button */}
        <Button
          variant="secondary"
          size="lg"
          className="px-8 py-6 text-md"
          onClick={() => router.push("/founder/loading")}
        >
          Let&apos;s Go
        </Button>
      </div>
    </div>
  );
}