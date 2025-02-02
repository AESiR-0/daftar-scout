import { StudioNav } from "@/components/navbar/studio-nav"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div className="bg-[#0e0e0e]">
            <ScrollArea className="h-[calc(100vh-8rem)]">
                <StudioNav />
                {children}
            </ScrollArea>
        </div>
    )
}
