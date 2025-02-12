"use client"

import { getScoutDetailsByName } from "@/lib/dummy-data/scout-details"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ShareButton } from "@/components/share-button"
import { useState } from "react"
import { SelectDaftarDialog } from "@/components/dialogs/select-daftar-dialog"
import { InvestorProfile } from "@/components/InvestorProfile"



function ErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold text-white">Scout Not Found</h1>
            <Link
                href="/founder/scout"
                className="px-4 py-2 bg-muted hover:bg-muted/50 text-white rounded transition-colors"
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
    onDaftarSince: "2022-01-15",
    bigPicture: "Building the future of investment and startup collaboration in MENA region",
    website: "https://daftar.com",
    location: "Dubai, UAE",
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
                                        className="w-full h-full object-cover rounded-[0.35rem] "
                                    />
                                </div>
                            </div>

                            {/* Title and Actions Section */}
                            <div className="flex items-center justify-between mt-4">
                                <div>
                                    <h1 className="text-2xl font-bold">{Scout.title}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="text-sm text-muted-foreground">
                                            Collaboration : {" "}
                                            <InvestorProfile
                                                investor={collaborationDetails}
                                            />
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
                                        className="bg-muted hover:bg-muted/50 text-white"
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
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem] ">
                                            {Scout.faqs.length}
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger value="updates" className="flex items-center gap-1">
                                        Updates
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem] ">
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
                                    <div className="p-2 pt-0  space-y-3">
                                        {Object.entries(Scout.details).map(([key, value]) => (
                                            <div key={key} className="rounded-[0.35rem]  ">
                                                <p className="text-sm text-muted-foreground ">{key}: <span className="font-medium">{value}</span></p>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="faqs" className="border-l-4 px-5 py-5">
                                    <div className="space-y-4">
                                        {Scout.faqs.map((faq, index) => (
                                            <div key={index} className="space-y-2">
                                                <h3 className="text-muted-foreground">{faq.question}</h3>
                                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="updates" className="border-l-4 px-5 py-5">
                                    <div className="space-y-2   ">
                                        {Scout.updates.map((update, index) => (
                                            <div key={index} className="p-4 pb-0 pt-0 rounded-[0.35rem]  ">
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

