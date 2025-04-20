"use client";

export default function ScoutPage() {
  const isPlanning = true; // This would come from your data source
  const isScheduling = false; // This would come from your data source

  if (isPlanning) {
    return (
      <div className="flex-1 flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
          Click on the Studio to scout Startups
          </p>
        </div>
      </div>
    );
  } else if (isScheduling) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          Your scout is scheduled.
          </p>
      </div>
    );
  }
  return (
    <div className="p-4 h-full flex items-center justify-center">
      <p className="text-muted-foreground">Select a pitch to view details</p>
    </div>
  );
}
