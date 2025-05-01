import { RootSidebar } from "@/components/navbar/root-sidebar"
import { TopNavRoot } from "@/components/navbar/top-nav-root"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen h-full">
      <RootSidebar />
      <div className="flex-1 flex flex-col">
        <TopNavRoot />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 