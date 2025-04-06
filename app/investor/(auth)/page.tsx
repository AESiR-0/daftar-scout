"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog";
import { useRouter } from "next/navigation";

export default function InvestorIntroPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createDaftarOpen, setCreateDaftarOpen] = useState(false);
  useEffect(() => {
    async function getDaftar() {
      const response = await fetch("/api/endpoints/daftar", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.length > 0) {
        console.log("data", data);
        router.push("/investor/scout");
        setLoading(false);
      } else {
        setLoading(false);
        setCreateDaftarOpen(true);
      }
    }
    getDaftar();
  }, []);
  // const handleProfileComplete = () => {
  //   setProfileOpen(false)
  //   setCreateDaftarOpen(true)
  // }

  const handleDaftarComplete = () => {
    setCreateDaftarOpen(false);
    router.push("/investor/loading");
  };

  if (loading) {
    return (
      <div className="min-h-screen gap-10 flex items-center flex-col justify-center">
        <h2 className="text-2xl"> Loading...</h2>

        <svg
          className="animate-spin h-10 w-10 text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 text-center">
        {/* Video Container */}
        {/* <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <video
            className="w-full h-full object-cover"
            src="/videos/intro.mp4"
            controls
          >
            Your browser does not support the video tag.
          </video>
        </div> */}

        {/* Text Content */}
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Connecting you to the new startup economy <br /> by simplifying
          startup scouting
        </h1>

        {/* Button */}
        <Button
          variant="secondary"
          size="lg"
          className="px-8 py-6 text-md"
          onClick={() => setCreateDaftarOpen(true)}
        >
          Let&apos;s Go
        </Button>
      </div>

      {/* <CompleteProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onSuccess={handleProfileComplete}
      /> */}

      <CreateDaftarDialog
        open={createDaftarOpen}
        onOpenChange={setCreateDaftarOpen}
        onSuccess={handleDaftarComplete}
      />
    </div>
  );
}
