import { Scout } from "../../types/scout";
import { canEditScout } from "@/lib/utils/scout";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface WithScoutLockProps {
  scout: Scout;
}

export function withScoutLock<P extends WithScoutLockProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithScoutLockComponent(props: P) {
    const { scout, ...rest } = props;
    const { toast } = useToast();

    useEffect(() => {
      if (!canEditScout(scout)) {
        toast({
          title: "Access Restricted",
          description:
            "This scout is no longer in the planning phase. Editing is restricted.",
          variant: "destructive",
        });
      }
    }, [scout, toast]);

    return <WrappedComponent {...(rest as P)} scout={scout} />;
  };
} 