import { Badge } from "@/components/ui/badge";

interface OffersHeaderProps {
  pendingCount: number;
}

export function OffersHeader({ pendingCount }: OffersHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Investment Offers</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage your offers</p>
      </div>
      <Badge variant="secondary" className="px-3 py-1">
        {pendingCount} Pending
      </Badge>
    </div>
  );
} 