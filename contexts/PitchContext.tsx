"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PitchContextType {
  pitchId: string | null;
  setPitchId: (pitchId: string | null) => void;
}

const PitchContext = createContext<PitchContextType | undefined>(undefined);

export function PitchProvider({ children }: { children: ReactNode }) {
  const [pitchId, setPitchId] = useState<string | null>(null);

  return (
    <PitchContext.Provider value={{ pitchId, setPitchId }}>
      {children}
    </PitchContext.Provider>
  );
}

export function usePitch() {
  const context = useContext(PitchContext);
  if (context === undefined) {
    throw new Error("usePitch must be used within a PitchProvider");
  }
  return context;
}
