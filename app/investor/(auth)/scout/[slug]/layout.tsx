import { ScoutSidebar } from "@/components/navbar/scout-sidebar"

export default function ScoutLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ScoutSidebar scoutSlug={params.slug} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 