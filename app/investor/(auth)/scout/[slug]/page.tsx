"use client"

export default function ScoutPage({ params }: { params: { slug: string } }) {
  const isPlanning = true // This would come from your data source
  const isScheduling = false // This would come from your data source

  if (isPlanning) {
    return (
      <div className="flex-1 flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
          Set up your scout from the studio.
          </p>
        </div>
      </div>
    )
  }

  else if (isScheduling) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Your scout is scheduled and will be live on Feb 20th, 2025, 10:00 AM.</p>
      </div>
    )
  }
  return (
    <div className="p-4 h-full flex items-center justify-center">
      <p className="text-muted-foreground">Select a pitch to view details</p>
    </div>
  )
} 