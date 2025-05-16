"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function StudioRedirect() {
  const path = usePathname();
  const id = path.split("/")[2];
  const pitchId = path.split("/")[3];
  const router = useRouter();

  useEffect(() => {
    router.push(`/founder/${id}/${pitchId}/studio/pitch-name`);
  }, [id, pitchId, router]);

  return null;
} 