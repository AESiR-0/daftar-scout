"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
const stages = [
    "Idea",
    "Prototyping To MVP",
    "Product-Market Fit",
    "Early Traction",
    "Growth",
]

const sectors = [
    "Accounting Technology",
    "Agriculture Technology",
    "AI (Artificial Intelligence)",
    "Aging and Elderly Care Tech",
    "Amazon Delivery Services",
    "Augmented Reality",
    "Automated Bookkeeping",
    "Automation",
    "Beauty Tech",
    "Biotechnology",
    "Blockchain",
    "B2B Platforms",
    "B2C Platforms",
    "Catering Technology",
    "Cloud Computing",
    "Cloud Storage",
    "Community Engagement",
    "Community Supported Agriculture (CSA)",
    "Compliance Technology",
    "Content Aggregators",
    "Content Creation",
    "Corporate Training",
    "Crowdsourced Content Platforms",
    "Crowdfunding",
    "Cyber Insurance",
    "Cybersecurity",
    "Cyber-Physical Systems",
    "Data Analytics",
    "Data Visualization",
    "Digital Entertainment",
    "Digital Identity Verification",
    "Digital Libraries",
    "Digital Marketing",
    "Digital Wallets",
    "Disaster Management Technology",
    "E-learning Platforms",
    "Edge Computing",
    "Esports",
    "Event Management Platforms",
    "Fashion Tech",
    "Fitness Apps",
    "Fitness Tech",
    "Food Delivery",
    "Food Waste Solutions",
    "Gaming",
    "Green Building Technology",
    "Health Monitoring",
    "Health Insurance Platforms",
    "Healthtech",
    "Healthcare",
    "Home Automation Systems",
    "Home Decor",
    "Home Improvement",
    "Home Healthcare",
    "HR Tech",
    "Hydroponics",
    "Insurtech",
    "Investment Platforms",
    "LegalTech",
    "Loyalty Programs",
    "Machine Learning (ML)",
    "Marketplace Lending",
    "Meal Kit Services",
    "Mental Health Platforms",
    "Mobile Apps",
    "Mobile Communication",
    "Nutritional Apps",
    "Online Fashion Retail",
    "Online Gaming",
    "Online Learning",
    "Online Market Research",
    "Online Retail Platforms",
    "Online Therapy Services",
    "Podcasting Platforms",
    "Personal Care Products",
    "Personal Finance",
    "Personal Savings Apps",
    "Plant-Based Foods",
    "Predictive Analytics",
    "Proptech",
    "Real Estate",
    "Recycling Technology",
    "Remote Work Solutions",
    "Reputation Management",
    "Robotics",
    "SaaS (Software as a Service)",
    "Silicon Chips",
    "Smart Asset Tracking",
    "Smart Contracts",
    "Smart Fitness Devices",
    "Smart Grids",
    "Smart Home Devices",
    "Social Impact",
    "Social Media",
    "Streaming Services",
    "Sustainability Solutions",
    "Sustainable Food",
    "Sustainable Packaging Solutions",
    "Telecommunications",
    "Telemedicine",
    "Transportation",
    "Transportation Network Companies"
]


export default function PitchNameForm({ pitch, mode }: { pitch: string, mode: string }) {
    const [pitchName, setPitchName] = useState(pitch)
    const [formState, setFormState] = useState({
        pitchName: pitchName,
        location: '',
        demoLink: '',
        startupStage: '',
        focusSectors: [''],
    })
    const [selectedSectors, setSelectedSectors] = useState<string[]>([])
    const [selectedStage, setSelectedStage] = useState('')
    const [error, setError] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
    }

    return (
        <Card className="w-full border-none my-0 p-0  bg-[#0e0e0e] max-w-6xl mx-auto">

            <CardContent className="border-none">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className=" flex gap-10 justify-between">
                        <div className="w-1/2 space-y-2">
                            <Label htmlFor="pitchName">Pitch Name</Label>
                            <Input
                                id="pitchName"
                                type="text"
                                placeholder="Enter your pitch name"
                                value={pitchName}
                                onChange={(e) => setPitchName(e.target.value)}
                                className="rounded w-full"
                            />
                        </div>
                        <div className="w-1/2 space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                type="text"
                                placeholder="Enter your location"
                                value={formState.location}
                                onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                                className="rounded w-full"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="demoLink">Demo Link</Label>
                        <Input
                            id="demoLink"
                            type="url"
                            placeholder="Enter your demo link"
                            value={formState.demoLink}
                            onChange={(e) => setFormState({ ...formState, demoLink: e.target.value })}
                            className="rounded w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Startup Stage</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                                {stages.map((stage) => (
                                    <SelectItem key={stage} value={stage.toLowerCase()}>
                                        {stage}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Focus Sectors</Label>
                        <Select
                            value=""
                            onValueChange={(value) => {
                                if (!selectedSectors.includes(value)) {
                                    setSelectedSectors(prev => [...prev, value])
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Add sectors" />
                            </SelectTrigger>
                            <SelectContent>
                                {sectors.map((sector) => (
                                    <SelectItem key={sector} value={sector.toLowerCase()}>
                                        {sector}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex flex-wrap gap-2 mt-3">
                            {selectedSectors.map((sector) => (
                                <Badge
                                    key={sector}
                                    variant="secondary"
                                    className="text-xs cursor-pointer hover:bg-muted"
                                    onClick={() => {
                                        setSelectedSectors(prev => prev.filter(s => s !== sector))
                                    }}
                                >
                                    {sector}
                                    <X className="h-3 w-3 ml-1" />
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Pitch"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}