import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { canEditScout } from "./scout";

/**
 * Hook to handle scout edit permissions
 * @param scoutId The scout ID
 * @returns Object containing canEdit state and loading state
 */
export function useScoutLock(scoutId: string) {
  const { toast } = useToast();
  const [canEdit, setCanEdit] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEditPermission = async () => {
      try {
        const res = await fetch(`/api/endpoints/scouts/details?scoutId=${scoutId}`);
        const data = await res.json();
        
        if (data?.data) {
          const canEditStatus = canEditScout(data.data);
          setCanEdit(canEditStatus);
          
          if (!canEditStatus) {
            toast({
              title: "Access Restricted",
              description: "This scout is no longer in the planning phase. Editing is restricted.",
              variant: "destructive",
            });
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking scout edit permission:", error);
        setLoading(false);
      }
    };

    checkEditPermission();
  }, [scoutId, toast]);

  return { canEdit, loading };
} 