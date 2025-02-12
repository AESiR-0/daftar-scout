import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"

interface InvestorProfileProps {
    name: string
    role: string
    className?: string
}

export function InvestorProfile({ name, role, className }: InvestorProfileProps) {
    return (
        <HoverCard>
            <HoverCardTrigger className={cn("hover:underline cursor-pointer", className)}>
                {name}
            </HoverCardTrigger>
            <HoverCardContent className="w-60">
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{name}</h4>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
} 