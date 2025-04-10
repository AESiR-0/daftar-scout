"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const path = usePathname();
  const id = path.split("/")[2];
  const router = useRouter();
  useEffect(() => {
    router.push(`/founder/${id}/studio/pitch-name`);
  }, []);
  return <></>;
}
