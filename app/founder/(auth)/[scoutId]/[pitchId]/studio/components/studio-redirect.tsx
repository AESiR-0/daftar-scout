"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function StudioRedirect() {
  const router = useRouter();
  const path = usePathname();
  if (!path) {
    router.push('/founder')
  }
  const id = path.split("/")[2];
  const pitchId = path.split("/")[3];

  useEffect(() => {
    router.push(`/founder/${id}/${pitchId}/studio/pitch-name`);
  }, [id, pitchId, router]);

  return null;
} 