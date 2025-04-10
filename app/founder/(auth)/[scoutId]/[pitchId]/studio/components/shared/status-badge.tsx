import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function StatusBadge({ status, variant = "secondary" }: StatusBadgeProps) {
  return (
    <Badge variant={variant} className="px-3 py-1">
      {status}
    </Badge>
  );
} 