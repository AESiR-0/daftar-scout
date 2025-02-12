import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface InvestorProfileProps {
    investor: {
        daftarName: string
        structure: string
        website: string
        location: string
        onDaftarSince: string
        bigPicture: string
        imageUrl?: string
    }
}

export function InvestorProfile({ investor }: InvestorProfileProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getInitials = (name: string) => {
        const words = name.split(' ')
        return words.length > 1 ? words[0][0] + words[1][0] : name[0]
    }

    return (
        <HoverCard>
            <HoverCardTrigger className="underline hover:underline cursor-pointer">
                {investor.daftarName}
            </HoverCardTrigger>
            <HoverCardContent className="w-72">

                <Avatar className="h-20 w-20 mb-5 text-3xl">
                    {investor.imageUrl ? (
                        <AvatarImage src={investor.imageUrl} alt={investor.daftarName} />
                    ) : (
                        <AvatarFallback>{getInitials(investor.daftarName)}</AvatarFallback>
                    )}
                </Avatar>
                <div>
                    <h4 className="text-sm font-medium">{investor.daftarName}</h4>
                    <p className="text-xs text-muted-foreground">{investor.structure}</p>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <Link href={investor.website} target="_blank" className="text-blue-600 hover:underline">
                            {investor.website}
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <p>{investor.location}</p>
                    </div>
                </div>

                <div className="mt-3 pt-3">
                    <p className="text-xs text-muted-foreground">The big picture we are working on</p>
                    <p className="text-xs mt-1">{investor.bigPicture}</p>
                </div>
                <br />
                <div className="flex flex-col items-start ">
                    <p className="text-muted-foreground">On Daftar Since</p>
                    <p>{formatDate(investor.onDaftarSince)}</p>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
} 