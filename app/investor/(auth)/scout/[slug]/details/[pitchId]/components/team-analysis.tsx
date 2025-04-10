"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format-date"
import { InvestorProfile } from "@/components/investor-profile"
import { cn } from "@/lib/utils"

interface TeamAnalysis {
    id: string
    nps: number
    analyst: {
        name: string
        role: string
        avatar: string
        daftarName: string
    }
    belief: 'yes' | 'no'
    note: string
    date: string
}

interface Profile {
    id: string
    name: string
    role: string
    daftarName: string
    avatar: string
}

interface TeamAnalysisSectionProps {
    teamAnalysis: TeamAnalysis[]

    currentProfile: Profile
    onSubmitAnalysis: (data: {
        belief: 'yes' | 'no'
        nps: number | null
        note: string | undefined
        analyst: Profile
    }) => Promise<void>
}

export function TeamAnalysisSection({
    teamAnalysis,
    currentProfile,
    onSubmitAnalysis
}: TeamAnalysisSectionProps) {
    const [belief, setBelief] = useState<'yes' | 'no'>()
    const [nps, setNps] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [note, setNote] = useState("")

    const handleSubmit = async () => {
        if (!belief || !note.trim() || nps === null) return
        setIsSubmitting(true)
        try {
            await onSubmitAnalysis({
                belief,
                nps,
                note,
                analyst: currentProfile
            })
            setHasSubmitted(true)
            setNote("")
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const teamSize = teamAnalysis.length
    const votersCount = teamAnalysis.length
    const interestedCount = teamAnalysis.filter(a => a.belief === 'yes').length
    const averageNPS = teamAnalysis.length > 0
        ? Math.round(teamAnalysis.reduce((sum, a) => sum + a.nps, 0) / teamAnalysis.length)
        : 0

    return (
        <div className="space-y-6">
            <div className="flex justify-between gap-10">
                {/* Left side - Your Analysis */}
                <div className="w-1/2">
                    <Card className="border-none bg-[#0e0e0e]">
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>How strongly do you believe in the startup?</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {Array.from({ length: 11 }, (_, i) => (
                                            <Button
                                                key={i}
                                                variant={nps === i ? 'default' : 'outline'}
                                                onClick={() => setNps(i)}
                                                className={cn(
                                                    "w-8 h-8 p-0",
                                                    nps === i && "bg-blue-600 hover:bg-blue-700"
                                                )}
                                            >
                                                {i}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 py-2 ">
                                    <Label>Should we meet the startup?</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={belief === 'yes' ? 'default' : 'outline'}
                                            onClick={() => setBelief('yes')}
                                            className={belief === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            variant={belief === 'no' ? 'default' : 'outline'}
                                            onClick={() => setBelief('no')}
                                            className={belief === 'no' ? 'bg-red-600 hover:bg-red-700' : ''}
                                        >
                                            No
                                        </Button>
                                    </div>
                                </div>


                                <div className="space-y-2">
                                    <Label>Your Analysis</Label>
                                    <Textarea 
                                        placeholder="Why do you want to meet... or not meet... in the startup?"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="min-h-[100px] rounded-[0.35rem] bg-muted/50 text-white border p-4"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Once you have submitted your analysis, you won't be able to withdraw or delete it.
                            </p>

                            <Button
                                onClick={handleSubmit}
                                disabled={!belief || !note.trim() || nps === null || isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                Submit Analysis
                            </Button>
                        </CardContent>
                    </Card>

                </div>

                {/* Right side - Team's Analysis */}
                <div className="w-1/2">
                    <Card className="border-none bg-[#0e0e0e]">
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {!hasSubmitted ? (
                                    <div className="flex items-center justify-center h-[400px] text-sm text-muted-foreground">
                                        <div className="space-y-2">
                                            <p className="text-sm">
                                                You can't view your team's analysis until you've shared your own experience.
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Note: Once you submit your analysis, it can't be withdrawn or deleted.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[500px] pr-4">
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-medium mb-4">Team's Analysis</h3>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-[#1a1a1a] p-4 rounded-md">
                                                        <p className="text-sm text-muted-foreground">Scout Team Size</p>
                                                        <p className="text-2xl font-medium">{teamSize}</p>
                                                    </div>
                                                    <div className="bg-[#1a1a1a] p-4 rounded-md">
                                                        <p className="text-sm text-muted-foreground">Voters</p>
                                                        <p className="text-2xl font-medium">{votersCount}</p>
                                                    </div>
                                                    <div className="bg-[#1a1a1a] p-4 rounded-md">
                                                        <p className="text-sm text-muted-foreground">Interested in Meeting</p>
                                                        <p className="text-2xl font-medium">{interestedCount}</p>
                                                    </div>
                                                    <div className="bg-[#1a1a1a] p-4 rounded-md">
                                                        <p className="text-sm text-muted-foreground">Average NPS</p>
                                                        <p className="text-2xl font-medium">{averageNPS}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {teamAnalysis.map((analysis) => (
                                                <div key={analysis.id} className="space-y-4 pb-6 border-b last:border-0">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {analysis.analyst.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {analysis.analyst.daftarName}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Interested in Meeting: {analysis.belief === 'yes' ? 'Yes' : 'No'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    NPS: {analysis.nps}
                                                                </p>
                                                            </div>

                                                        </div>
                                                        <div
                                                            className="text-xs py-1 text-muted-foreground prose prose-sm dark:prose-invert  max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: analysis.note }}
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(analysis.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 