import { StudioNav } from "@/components/navbar/studio-nav"
import { StudioSidebar } from "@/components/navbar/studio-sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <StudioNav />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
