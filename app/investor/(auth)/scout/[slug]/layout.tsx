import { ScoutSidebar } from "@/components/navbar/scout-sidebar"

interface ScoutStatus {
  isPlanning: boolean
  isScheduling: boolean
  scheduledDate?: string
}

const getScoutStatus = (slug: string): ScoutStatus => {
  // This would come from your data source
  const statuses: Record<string, ScoutStatus> = {
    'green-energy': { 
      isPlanning: true, 
      isScheduling: false 
    },
    'ai-ventures': { 
      isPlanning: false, 
      isScheduling: true,
      scheduledDate: "Feb 20th, 2025, 10:00 AM"
    },
  }
  return statuses[slug] || { isPlanning: false, isScheduling: false }
}

export default function ScoutLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const status = getScoutStatus(params.slug)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ScoutSidebar isPlanning={status.isPlanning} isScheduling={status.isScheduling} />
      <div className="flex-1">
        {status.isPlanning ? (
          <div className="flex-1 flex h-full items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Set up your scout from the studio.
              </p>
            </div>
          </div>
        ) : status.isScheduling ? (
          <div className="p-4 h-full flex items-center justify-center">
            <p className="text-muted-foreground">
              Your scout is scheduled and will be live on {status.scheduledDate}.
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
} 