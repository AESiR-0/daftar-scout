"use client"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AudienceDetails {
  location: string
  community: string
  gender: string
  ageMin: string
  ageMax: string
  stage: string
  sector: string
  targetIndustries: string[]
  stages: string[]
}

function AudienceContent() {
  const pathname = usePathname()
  const mode = pathname.includes('edit') ? 'edit' : 'add'
  const programId = pathname.split('/').pop()
  const [audience, setAudience] = useState<AudienceDetails>({
    location: "",
    community: "",
    gender: "",
    ageMin: "",
    ageMax: "",
    stage: "",
    sector: "",
    targetIndustries: [],
    stages: []
  })

  useEffect(() => {
    if (mode === 'edit' && programId) {
      fetchAudienceDetails(programId)
    }
  }, [mode, programId])

  const fetchAudienceDetails = async (id: string) => {
    // Simulate API call
    const data = {
      location: "UAE",
      community: "auto-rickshaw",
      gender: "male",
      ageMin: "20",
      ageMax: "30",
      stage: "idea",
      sector: "accounting",
      targetIndustries: ["Tech", "Healthcare"],
      stages: ["Seed", "Series A"]
    }
    setAudience(data)
  }

  const handleSave = async () => {
    if (mode === 'edit') {
      console.log("Updating audience:", programId, audience)
    } else {
      console.log("Creating audience:", audience)
    }
  }

  return (
    <div className="space-y-6 container mx-auto px-4">
      <div className="pr-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={audience.location}
              onValueChange={(value) => setAudience(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uae">UAE</SelectItem>
                <SelectItem value="ksa">KSA</SelectItem>
                <SelectItem value="qatar">Qatar</SelectItem>
                <SelectItem value="kuwait">Kuwait</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Community</Label>
            <Select
              value={audience.community}
              onValueChange={(value) => setAudience(prev => ({ ...prev, community: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select community" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto-rickshaw">Auto-rickshaw drivers</SelectItem>
                <SelectItem value="black-lives">Black Lives Matter activists</SelectItem>
                <SelectItem value="coastal">Coastal cleanup crews</SelectItem>
                <SelectItem value="criminals">Criminals seeking to change their lives positively</SelectItem>
                <SelectItem value="delivery">Delivery gig workers</SelectItem>
                <SelectItem value="doctors">Doctors in tech</SelectItem>
                <SelectItem value="eco-friendly">Eco-friendly fashion designers</SelectItem>
                <SelectItem value="engineers">Engineers</SelectItem>
                <SelectItem value="failed">Failed startup founders</SelectItem>
                <SelectItem value="farmers">Farmers</SelectItem>
                <SelectItem value="government">Government school students</SelectItem>
                <SelectItem value="homeless">Homeless</SelectItem>
                <SelectItem value="influencers">Influencers with 1 million followers</SelectItem>
                <SelectItem value="lgbtq">LGBTQ+</SelectItem>
                <SelectItem value="management">Management students</SelectItem>
                <SelectItem value="mckinsey">McKinsey consultants</SelectItem>
                <SelectItem value="migrants">Migrants</SelectItem>
                <SelectItem value="news">News and media</SelectItem>
                <SelectItem value="andaman">People of Andaman & Lakshadweep</SelectItem>
                <SelectItem value="ladakh">People of Ladakh</SelectItem>
                <SelectItem value="disabilities">People with disabilities</SelectItem>
                <SelectItem value="remedies">People with special home remedies</SelectItem>
                <SelectItem value="refugees">Refugees</SelectItem>
                <SelectItem value="old-age">Residents of old age homes</SelectItem>
                <SelectItem value="retired">Retired professionals</SelectItem>
                <SelectItem value="second-time">Second-time founders</SelectItem>
                <SelectItem value="sewage">Sewage cleaners</SelectItem>
                <SelectItem value="social">Social impact founders</SelectItem>
                <SelectItem value="special">Special Forces and Armed Forces</SelectItem>
                <SelectItem value="street">Street food vendors</SelectItem>
                <SelectItem value="ukrainian">Ukrainian war refugees</SelectItem>
                <SelectItem value="under-25">Under 25 founders</SelectItem>
                <SelectItem value="urban">Urban waste management workers</SelectItem>
                <SelectItem value="war">War Soldiers</SelectItem>
                <SelectItem value="women">Women</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={audience.gender}
              onValueChange={(value) => setAudience(prev => ({ ...prev, gender: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male Only Team</SelectItem>
                <SelectItem value="female">Female Only Team</SelectItem>
                <SelectItem value="trans">Trans Only</SelectItem>
                <SelectItem value="at-least-one">At Least One</SelectItem>
                <SelectItem value="at-least-one-male">At least one Male</SelectItem>
                <SelectItem value="at-least-one-female">At least one Female</SelectItem>
                <SelectItem value="at-least-one-transgender">At least one Transgender</SelectItem>
                <SelectItem value="open-for-all">Open For All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Age Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={audience.ageMin}
                onChange={(e) => setAudience(prev => ({ ...prev, ageMin: e.target.value }))}
                className="h-9"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={audience.ageMax}
                onChange={(e) => setAudience(prev => ({ ...prev, ageMax: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Stage</Label>
            <Select
              value={audience.stage}
              onValueChange={(value) => setAudience(prev => ({ ...prev, stage: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea Stage</SelectItem>
                <SelectItem value="mvp">Prototype to MVP</SelectItem>
                <SelectItem value="product">Product Market Fit</SelectItem>
                <SelectItem value="early">Early Traction</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sector</Label>
            <Select
              value={audience.sector}
              onValueChange={(value) => setAudience(prev => ({ ...prev, sector: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accounting">Accounting Technology</SelectItem>
                <SelectItem value="agriculture">Agriculture Technology</SelectItem>
                <SelectItem value="ai">AI (Artificial Intelligence)</SelectItem>
                <SelectItem value="aging">Aging and Elderly Care Tech</SelectItem>
                <SelectItem value="amazon">Amazon Delivery Services</SelectItem>
                <SelectItem value="augmented">Augmented Reality</SelectItem>
                <SelectItem value="automated">Automated Bookkeeping</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="beauty">Beauty Tech</SelectItem>
                <SelectItem value="biotechnology">Biotechnology</SelectItem>
                <SelectItem value="blockchain">Blockchain</SelectItem>
                <SelectItem value="b2b">B2B Platforms</SelectItem>
                <SelectItem value="b2c">B2C Platforms</SelectItem>
                <SelectItem value="catering">Catering Technology</SelectItem>
                <SelectItem value="cloud">Cloud Computing</SelectItem>
                <SelectItem value="cloud">Cloud Storage</SelectItem>
                <SelectItem value="community">Community Engagement</SelectItem>
                <SelectItem value="csa">Community Supported Agriculture (CSA)</SelectItem>
                <SelectItem value="compliance">Compliance Technology</SelectItem>
                <SelectItem value="content">Content Aggregators</SelectItem>
                <SelectItem value="content">Content Creation</SelectItem>
                <SelectItem value="corporate">Corporate Training</SelectItem>
                <SelectItem value="crowdsourced">Crowdsourced Content Platforms</SelectItem>
                <SelectItem value="crowdfunding">Crowdfunding</SelectItem>
                <SelectItem value="cyber">Cyber Insurance</SelectItem>
                <SelectItem value="cyber">Cybersecurity</SelectItem>
                <SelectItem value="cyber">Cyber-Physical Systems</SelectItem>
                <SelectItem value="data">Data Analytics</SelectItem>
                <SelectItem value="data">Data Visualization</SelectItem>
                <SelectItem value="digital">Digital Entertainment</SelectItem>
                <SelectItem value="digital">Digital Identity Verification</SelectItem>
                <SelectItem value="digital">Digital Libraries</SelectItem>
                <SelectItem value="digital">Digital Marketing</SelectItem>
                <SelectItem value="digital">Digital Wallets</SelectItem>
                <SelectItem value="disaster">Disaster Management Technology</SelectItem>
                <SelectItem value="e-learning">E-learning Platforms</SelectItem>
                <SelectItem value="edge">Edge Computing</SelectItem>
                <SelectItem value="esports">Esports</SelectItem>
                <SelectItem value="event">Event Management Platforms</SelectItem>
                <SelectItem value="fashion">Fashion Tech</SelectItem>
                <SelectItem value="fitness">Fitness Apps</SelectItem>
                <SelectItem value="fitness">Fitness Tech</SelectItem>
                <SelectItem value="food">Food Delivery</SelectItem>
                <SelectItem value="food">Food Waste Solutions</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="green">Green Building Technology</SelectItem>
                <SelectItem value="health">Health Monitoring</SelectItem>
                <SelectItem value="health">Health Insurance Platforms</SelectItem>
                <SelectItem value="healthtech">Healthtech</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="home">Home Automation Systems</SelectItem>
                <SelectItem value="home">Home Decor</SelectItem>
                <SelectItem value="home">Home Improvement</SelectItem>
                <SelectItem value="home">Home Healthcare</SelectItem>
                <SelectItem value="hr">HR Tech</SelectItem>
                <SelectItem value="hydroponics">Hydroponics</SelectItem>
                <SelectItem value="insurtech">Insurtech</SelectItem>
                <SelectItem value="investment">Investment Platforms</SelectItem>
                <SelectItem value="legaltech">LegalTech</SelectItem>
                <SelectItem value="loyalty">Loyalty Programs</SelectItem>
                <SelectItem value="machine">Machine Learning (ML)</SelectItem>
                <SelectItem value="marketplace">Marketplace Lending</SelectItem>
                <SelectItem value="meal">Meal Kit Services</SelectItem>
                <SelectItem value="mental">Mental Health Platforms</SelectItem>
                <SelectItem value="mobile">Mobile Apps</SelectItem>
                <SelectItem value="mobile">Mobile Communication</SelectItem>
                <SelectItem value="nutritional">Nutritional Apps</SelectItem>
                <SelectItem value="online">Online Fashion Retail</SelectItem>
                <SelectItem value="online">Online Gaming</SelectItem>
                <SelectItem value="online">Online Learning</SelectItem>
                <SelectItem value="online">Online Market Research</SelectItem>
                <SelectItem value="online">Online Retail Platforms</SelectItem>
                <SelectItem value="online">Online Therapy Services</SelectItem>
                <SelectItem value="podcasting">Podcasting Platforms</SelectItem>
                <SelectItem value="personal">Personal Care Products</SelectItem>
                <SelectItem value="personal">Personal Finance</SelectItem>
                <SelectItem value="personal">Personal Savings Apps</SelectItem>
                <SelectItem value="plant">Plant-Based Foods</SelectItem>
                <SelectItem value="predictive">Predictive Analytics</SelectItem>
                <SelectItem value="proptech">Proptech</SelectItem>
                <SelectItem value="real">Real Estate</SelectItem>
                <SelectItem value="recycling">Recycling Technology</SelectItem>
                <SelectItem value="remote">Remote Work Solutions</SelectItem>
                <SelectItem value="reputation">Reputation Management</SelectItem>
                <SelectItem value="robotics">Robotics</SelectItem>
                <SelectItem value="saas">SaaS (Software as a Service)</SelectItem>
                <SelectItem value="silicon">Silicon Chips</SelectItem>
                <SelectItem value="smart">Smart Asset Tracking</SelectItem>
                <SelectItem value="smart">Smart Contracts</SelectItem>
                <SelectItem value="smart">Smart Fitness Devices</SelectItem>
                <SelectItem value="smart">Smart Grids</SelectItem>
                <SelectItem value="smart">Smart Home Devices</SelectItem>
                <SelectItem value="social">Social Impact</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="streaming">Streaming Services</SelectItem>
                <SelectItem value="sustainability">Sustainability Solutions</SelectItem>
                <SelectItem value="sustainable">Sustainable Food</SelectItem>
                <SelectItem value="sustainable">Sustainable Packaging Solutions</SelectItem>
                <SelectItem value="telecommunications">Telecommunications</SelectItem>
                <SelectItem value="telemedicine">Telemedicine</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="transportation">Transportation Network Companies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AudienceContent;