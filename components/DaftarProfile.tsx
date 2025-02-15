import formatDate from "@/lib/formatDate";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import Link from "next/link";

export function DaftarProfile({ collaborator }: { collaborator: any }) {
    return (
        <HoverCard>
            <HoverCardTrigger className="flex items-center gap-2 cursor-pointer">
                <span className="text-white hover:underline">
                    {collaborator.daftarName}
                </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={collaborator.daftarDetails.ownerAvatar} />
                        <AvatarFallback>DO</AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="text-sm font-medium">{collaborator.daftarName}</h4>

                    </div>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Structure:</span>
                        <span>{collaborator.daftarDetails.structure}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{collaborator.daftarDetails.location}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Website:</span>
                        <Link
                            href={collaborator.daftarDetails.website}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                        >
                            {collaborator.daftarDetails.website}
                        </Link>
                    </div>
                    <div className="mt-2">
                        <span className="text-muted-foreground">The big picture we are working on</span>
                        <p className="mt-1 min-h-[100px] p-3 bg-muted rounded-lg">{collaborator.daftarDetails.biggerPicture}</p>
                    </div>
                    <div className="">
                        <span className="text-foreground">On Daftar Since</span>
                        <p className="mt-1  text-muted-foreground rounded-lg">{formatDate(new Date(collaborator.addedAt).toISOString())}</p>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}
