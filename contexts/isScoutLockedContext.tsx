"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface IsScoutLockedContextType {
  isLocked: boolean;
  isLoading: boolean;
  scoutId: string;
  setScoutId: (id: string) => void;
}

const IsScoutLockedContext = createContext<IsScoutLockedContextType>({
  isLocked: false,
  isLoading: true,
  scoutId: "",
  setScoutId: () => {},
});

export function IsScoutLockedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scoutId, setScoutId] = useState("");
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Extract scoutId from pathname
    const segments = pathname.split("/");
    const id = segments[3]; // Assuming path is /investor/(auth)/scout/[slug]/...
    if (id) {
      setScoutId(id);
    }
  }, [pathname]);

  useEffect(() => {
    if (!scoutId) return;

    const fetchScoutStatus = async () => {
      try {
        const response = await fetch(`/api/endpoints/scout/status?scoutId=${scoutId}`);
        if (!response.ok) throw new Error("Failed to fetch scout status");
        
        const data = await response.json();
        // Lock if status is not "planning" or "Planning"
        setIsLocked(data.status !== "planning" && data.status !== "Planning");
      } catch (error) {
        console.error("Error fetching scout status:", error);
        toast({
          title: "Error",
          description: "Failed to fetch scout status",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScoutStatus();
  }, [scoutId, toast]);

  return (
    <IsScoutLockedContext.Provider
      value={{
        isLocked,
        isLoading,
        scoutId,
        setScoutId,
      }}
    >
      {children}
    </IsScoutLockedContext.Provider>
  );
}

export const useIsScoutLocked = () => {
  const context = useContext(IsScoutLockedContext);
  if (!context) {
    throw new Error("useIsScoutLocked must be used within an IsScoutLockedProvider");
  }
  return context;
}; 