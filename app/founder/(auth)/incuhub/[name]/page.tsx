"use client"

import { ScoutDetails, getScoutDetailsByName } from "@/lib/dummy-data/scout-details"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShareButton } from "@/components/share-button"
import { Metadata } from "next"
import { useState } from "react"
import { SelectDaftarDialog } from "@/components/dialogs/select-daftar-dialog"

function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
    );
}

function ErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold text-white">Scout Not Found</h1>
            <Link
                href="/founder/incuhub"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                Go Back
            </Link>
        </div>
    );
}

const collaborationDetails = {
    image: "https://github.com/shadcn.png",
    daftarName: "Daftar OS",
    structure: "Technology Platform",
    team: "25+ members",
    website: "https://daftar.com",
    location: "Dubai, UAE",
    vision: "Building the future of investment and startup collaboration in MENA region",
    memberSince: "2022-01-15"
}

export default function Page() {
    const pathname = usePathname()
    const name = pathname.split('/').pop() || ''
    const Scout = getScoutDetailsByName(name)
    const [showDaftarDialog, setShowDaftarDialog] = useState(false)

    if (!Scout) {
        return <ErrorPage />
    }

    return (
        <>
            <div className="space-y-6 container mx-auto px-10">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="space-y-6 flex">
                        {/* Video Section */}
                        <div className="">
                            <div className="flex justify-center">
                                <div className="relative aspect-video h-[30rem]">
                                    <video
                                        src={Scout.videoUrl}
                                        controls
                                        className="w-full h-full object-cover rounded-[0.3rem]"
                                    />
                                </div>
                            </div>

                            {/* Title and Actions Section */}
                            <div className="flex items-center justify-between mt-4">
                                <div>
                                    <h1 className="text-2xl font-bold">{Scout.title}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="text-sm text-muted-foreground">
                                            In collaboration with{" "}
                                            <HoverCard>
                                                <HoverCardTrigger className="inline-flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
                                                    {Scout.collaboration}
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-72">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={collaborationDetails.image} />
                                                            <AvatarFallback>DO</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h4 className="text-sm font-medium">{collaborationDetails.daftarName}</h4>
                                                            <p className="text-xs text-muted-foreground">{collaborationDetails.structure}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 space-y-2 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-muted-foreground">Team:</p>
                                                            <p>{collaborationDetails.team}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-muted-foreground">Website:</p>
                                                            <Link href={collaborationDetails.website} target="_blank" className="text-blue-600 hover:underline">{collaborationDetails.website}</Link>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-muted-foreground">Location:</p>
                                                            <p>{collaborationDetails.location}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-muted-foreground">Member since:</p>
                                                            <p>{new Date(collaborationDetails.memberSince).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 pt-3">
                                                        <p className="text-xs text-muted-foreground">The Big Picture</p>
                                                        <p className="text-xs mt-1">{collaborationDetails.vision}</p>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-bold mt-2">
                                        Last date for pitch: {Scout.lastPitchDate}
                                    </p>
                                </div>
                                <div className="flex text-md items-center gap-4">
                                    <ShareButton
                                        title={Scout.title}
                                        description={Scout.description}
                                    />
                                    <Button
                                        className="bg-blue-600 border hover:bg-blue-700 text-white"
                                        onClick={() => setShowDaftarDialog(true)}
                                    >
                                        Pitch Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className=" ml-6 pl-3 h-full">
                            {/* Tabs Section */}
                            <Tabs defaultValue="about" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="about">About</TabsTrigger>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="faqs" className="flex items-center gap-1">
                                        FAQs
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.3rem]">
                                            {Scout.faqs.length}
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger value="updates" className="flex items-center gap-1">
                                        Updates
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.3rem]">
                                            {Scout.updates.length}
                                        </span>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="about" className="space-y-4 ">
                                    <div className="prose max-w-none border-l-4  px-5 py-5">
                                        <p className="text-sm text-muted-foreground">{Scout.about}</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="details" className="border-l-4 px-5 py-5">
                                    <div className="p-2 bg-muted/50 space-y-2">
                                        {Object.entries(Scout.details).map(([key, value]) => (
                                            <div key={key} className="rounded-[0.3rem] ">
                                                <p className="text-sm text-muted-foreground capitalize">{key}: <span className="font-medium">{value}</span></p>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="faqs" className="border-l-4 px-5 py-5">
                                    <div className="space-y-4">
                                        {Scout.faqs.map((faq, index) => (
                                            <div key={index} className="space-y-2">
                                                <h3 className="font-medium">{faq.question}</h3>
                                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="updates" className="border-l-4 px-5 py-5">
                                    <div className="space-y-4">
                                        {Scout.updates.map((update, index) => (
                                            <div key={index} className="p-4 rounded-[0.3rem] bg-muted/50">
                                                <p className="text-sm text-muted-foreground">{new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                <p className="text-sm text-muted-foreground">{update.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            <SelectDaftarDialog
                open={showDaftarDialog}
                onOpenChange={setShowDaftarDialog}
                scoutSlug={Scout.slug}
            />
        </>
    )
}

