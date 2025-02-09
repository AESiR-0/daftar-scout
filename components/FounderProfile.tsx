import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface FounderProfileProps {
    founder: {
        name: string
        age: string
        email: string
        phone: string
        gender: string
        location: string
        language: string[]
        imageUrl?: string
    }
}

export function FounderProfile({ founder }: FounderProfileProps) {
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
            <HoverCardTrigger className="inline-flex items-center  hover:underline cursor-pointer">
                {founder.name}
            </HoverCardTrigger>
            <HoverCardContent className="w-72">
                <Avatar className="h-20 w-20 mb-5 text-3xl">
                    {founder.imageUrl ? (
                        <AvatarImage src={founder.imageUrl} alt={founder.name} />
                    ) : (
                        <AvatarFallback>{getInitials(founder.name)}</AvatarFallback>
                    )}
                </Avatar>
                <div className="flex flex-col">
                    <h4 className="text-sm font-medium">{founder.name}</h4>
                    <h4 className="text-xs  flex gap-3 text-muted-foreground">
                        <span> {founder.age}</span>
                        <span>{founder.gender}</span>
                    </h4>
                </div>
                <div className="flex text-xs flex-col">
                    <p>{founder.email}</p>
                    <p>{founder.phone}</p>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <p>{founder.location}</p>
                    </div>
                </div>
                <br />
                <div className="flex text-xs flex-col gap-2">
                    <span>
                        Preferred language to connect with investors
                    </span>
                    <span className="flex gap-2 flex-wrap">
                        {founder.language.map((language) => (
                            <span key={language} className="bg-muted p-1 rounded-md">{language}</span>
                        ))}</span>
                </div>



            </HoverCardContent>
        </HoverCard>
    )
} 