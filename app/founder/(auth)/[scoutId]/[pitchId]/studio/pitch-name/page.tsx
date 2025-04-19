"use client";

import { usePathname } from "next/navigation";
import { StudioCard } from "../components/layout/studio-card";
import PitchNameForm from "./form";

export default function PitchNamePage() {


  return (
    <StudioCard>
      <PitchNameForm  />
    </StudioCard>
  );
}
