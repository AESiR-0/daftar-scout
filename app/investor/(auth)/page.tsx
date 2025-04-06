"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog";
import { useRouter } from "next/navigation";

export default function InvestorIntroPage() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
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
      } else {
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
