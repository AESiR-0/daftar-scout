"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface IsLockedContextType {
    isLocked: boolean;
    setIsLocked: (isLocked: boolean) => void;
    pitchId: string | null;
    scoutId: string | null;
    setScoutId: (scoutId: string | null) => void;
    setPitchId: (pitchId: string | null) => void;
    isLoading: boolean;
}

const IsLockedContext = createContext<IsLockedContextType | undefined>(undefined);

export function IsLockedProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const pathname = usePathname();
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [pitchId, setPitchId] = useState<string | null>(null);
    const [scoutId, setScoutId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Extract IDs from pathname
    useEffect(() => {
        const pathSegments = pathname.split('/');
        const extractedScoutId = pathSegments[2] || null;
        const extractedPitchId = pathSegments[3] || null;

        setScoutId(extractedScoutId);
        setPitchId(extractedPitchId);
    }, [pathname]);

    useEffect(() => {
        const fetchPitchStatus = async () => {
            if (pitchId && scoutId) {
                try {
                    setIsLoading(true);
                    const response = await fetch(
                        `/api/endpoints/pitch/founder/lock?pitchId=${pitchId}&scoutId=${scoutId}`
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch pitch status");
                    }

                    const data = await response.json();
                    setIsLocked(data.isLocked);
                } catch (error) {
                    console.error("Error fetching pitch status:", error);
                    toast({
                        title: "Error",
                        description: "Failed to fetch pitch status",
                        variant: "destructive",
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchPitchStatus();
    }, [pitchId, scoutId, toast]);

    return (
        <IsLockedContext.Provider
            value={{
                isLocked,
                setIsLocked,
                pitchId,
                setPitchId,
                scoutId,
                setScoutId,
                isLoading,
            }}
        >
            {children}
        </IsLockedContext.Provider>
    );
}

export function useIsLocked() {
    const context = useContext(IsLockedContext);
    if (context === undefined) {
        throw new Error("useIsLocked must be used within a IsLockedProvider");
    }
    return context;
}
