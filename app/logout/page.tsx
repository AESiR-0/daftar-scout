"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut({ redirect: false });
      router.push("/landing");
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-medium mb-2">Logging out...</h1>
        <p className="text-muted-foreground">Please wait while we sign you out.</p>
      </div>
    </div>
  );
} 