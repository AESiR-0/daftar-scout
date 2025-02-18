import { ScoutSidebar } from "@/components/navbar/scout-sidebar"

export default function ScoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ScoutSidebar  />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 