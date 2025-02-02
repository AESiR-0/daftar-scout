"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

// Move data to separate file later
const mockData = {
    scout: [
        { id: "1", name: "Tech Innovation Fund" },
        { id: "2", name: "Healthcare Ventures" },
    ],
    collaboration: {
        name: "Daftar OS",
        image: "https://github.com/shadcn.png",
        structure: "Investment Fund",
        team: "15 members",
        website: "https://daftar.com",
        location: "Dubai, UAE",
        memberSince: "2024-01-01",
        vision: "To revolutionize the investment landscape"
    },
    pitch: {
        status: "Under Review",
        location: "Dubai, UAE",
        stage: "Series A",
        demoLink: "https://demo.example.com",
        sectors: ["Fintech", "AI"],
        questions: [
            { question: "What problem are you solving?" },
            { question: "What's your market size?" }
        ],
        foundersAsk: [
            { title: "Investment Amount", value: "$1M" },
            { title: "Equity", value: "10%" }
        ],
        team: {
            size: 5,
            members: [
                {
                    name: "John Doe",
                    designation: "CEO",
                    age: 35,
                    email: "john@example.com",
                    phone: "+971 50 123 4567",
                    preferredLanguages: ["English", "Arabic"],
                    avatar: "https://github.com/shadcn.png"
                }
            ],
            ageData: [
                { x: "20-30", y: 3 },
                { x: "30-40", y: 2 }
            ],
            genderData: [
                { x: "Male", y: 3 },
                { x: "Female", y: 2 }
            ]
        }
    }
}

// Chart options
const lineChartOptions = {
    chart: {
        type: 'line',
        toolbar: { show: false },
        background: 'transparent'
    },
    stroke: {
        curve: 'smooth',
        width: 2
    },
    colors: ['#2563eb'],
    theme: {
        mode: 'dark'
    },
    grid: {
        borderColor: '#334155'
    },
    xaxis: {
        labels: {
            style: { colors: '#94a3b8' }
        }
    },
    yaxis: {
        labels: {
            style: { colors: '#94a3b8' }
        }
    }
}

const pieChartOptions = {
    chart: {
        type: 'pie',
        background: 'transparent'
    },
    colors: ['#3b82f6', '#f43f5e'],
    theme: {
        mode: 'dark'
    },
    legend: {
        position: 'bottom',
        labels: {
            colors: '#94a3b8'
        }
    },
    dataLabels: {
        style: {
            colors: ['#fff']
        }
    }
}

export default function ReportPage() {
    const router = useRouter()
    const params = useParams()
    const { slug, pitchId } = params;
    const [selectedProgram, setSelectedProgram] = useState<string>("")
    const { scout, collaboration, pitch } = mockData

    return (
        <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-8 px-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-xl font-semibold">Daftars Report</h1>
                    </div>
                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent>
                            {scout.map((program) => (
                                <SelectItem key={program.id} value={program.id}>
                                    {program.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Collaboration Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            In collaboration with{" "}
                            <HoverCard>
                                <HoverCardTrigger className="text-blue-500 hover:underline cursor-pointer">
                                    {collaboration.name}
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                    <CollaborationCard collaboration={collaboration} />
                                </HoverCardContent>
                            </HoverCard>
                        </CardTitle>
                    </CardHeader>
                </Card>

                {/* Pitch Details */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Pitch Details</CardTitle>
                            <Badge variant="secondary">{pitch.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <PitchInfo pitch={pitch} />
                        <FoundersAsk foundersAsk={pitch.foundersAsk} />
                    </CardContent>
                </Card>

                {/* Team Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team ({pitch.team.size} members)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-6">
                            <TeamMembers members={pitch.team.members} />
                            <TeamStats ageData={pitch.team.ageData} genderData={pitch.team.genderData} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    )
}

// Separate components for better organization
function CollaborationCard({ collaboration }: { collaboration: typeof mockData.collaboration }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={collaboration.image} />
                    <AvatarFallback>DO</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="text-sm font-medium">{collaboration.name}</h4>
                    <p className="text-xs text-muted-foreground">{collaboration.structure}</p>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Team</span>
                    <span>{collaboration.team}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{collaboration.location}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span>{new Date(collaboration.memberSince).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Website</span>
                    <Link href={collaboration.website} className="text-blue-500 hover:underline" target="_blank">
                        {collaboration.website}
                    </Link>
                </div>
            </div>

            <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">Vision</p>
                <p className="text-sm mt-1">{collaboration.vision}</p>
            </div>
        </div>
    )
}

function PitchInfo({ pitch }: { pitch: typeof mockData.pitch }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="text-sm font-medium">{pitch.location}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Stage</p>
                            <p className="text-sm font-medium">{pitch.stage}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">Sectors</p>
                <div className="flex gap-2">
                    {pitch.sectors.map(sector => (
                        <Badge key={sector} variant="secondary">
                            {sector}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">Key Questions</p>
                <div className="space-y-3">
                    {pitch.questions.map((q, i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">{q.question}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function FoundersAsk({ foundersAsk }: { foundersAsk: typeof mockData.pitch.foundersAsk }) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium">Founder's Ask</h3>
            <div className="grid grid-cols-2 gap-4">
                {foundersAsk.map(item => (
                    <Card key={item.title}>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">{item.title}</p>
                                <p className="text-sm font-medium">{item.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function TeamMembers({ members }: { members: typeof mockData.pitch.team.members }) {
    return (
        <div className="space-y-4">
            {members.map(member => (
                <Card key={member.name}>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-3 flex-1">
                                <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.designation}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{member.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{member.phone}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {member.preferredLanguages.map(lang => (
                                        <Badge key={lang} variant="secondary" className="text-xs">
                                            {lang}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function TeamStats({
    ageData,
    genderData
}: {
    ageData: typeof mockData.pitch.team.ageData
    genderData: typeof mockData.pitch.team.genderData
}) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <Chart
                        options={{
                            xaxis: {
                                ...lineChartOptions.xaxis,
                                categories: ageData.map(d => d.x)
                            }
                        }}
                        series={[{
                            name: 'Members',
                            data: ageData.map(d => d.y)
                        }]}
                        type="line"
                        height={200}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <Chart
                        options={{
                            labels: genderData.map(d => d.x)
                        }}
                        series={genderData.map(d => d.y)}
                        type="pie"
                        height={200}
                    />
                </CardContent>
            </Card>
        </div>
    )
} 