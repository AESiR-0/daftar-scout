"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Camera, Trash2, UserCircle, MessageSquarePlus, Shield, LogOut, Share2, Settings, Database, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { signOut } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Combobox } from "@/components/ui/combobox"
import formatDate from "@/lib/formatDate"
import { Card } from "@/components/ui/card"

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  primaryLanguage: string
  secondaryLanguage: string
  languageProficiency: {
    primary: 'beginner' | 'intermediate' | 'advanced'
    secondary: 'beginner' | 'intermediate' | 'advanced'
  }
  country: string
  city: string
  company: string
  position: string
  industry: string
  experience: string
}

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FeedbackEntry {
  id: string
  message: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
}

interface DaftarOption {
  id: string;
  name: string;
}

interface DaftarDesignation {
  [daftarId: string]: string;
}

const daftarOptions: DaftarOption[] = [
  { id: "1", name: "Women's Network" },
  { id: "2", name: "Young Professionals Network" },
  { id: "3", name: "Swiggy" },
];

const navItems = [
  { title: "Profile", value: "profile", icon: UserCircle },
  { title: "Feature Request", value: "feature", icon: MessageSquarePlus },
  { title: "Privacy Policy", value: "privacy", icon: Shield },
  { title: "Delete Account", value: "delete", icon: Trash2 },
]

type ProfileTab = "account" | "support" | "feedback" | "feature" | "privacy" | "delete" | "logout"

export function ProfileDialog({
  open,
  onOpenChange,
}: ProfileDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<ProfileTab>("account")
  const [isEditing, setIsEditing] = useState(false)
  const [featureRequest, setFeatureRequest] = useState("")
  const [feedbackHistory] = useState<FeedbackEntry[]>([
    {
      id: '1',
      message: "Add dark mode support across the platform",
      status: 'completed',
      createdAt: '2024-03-15T10:30:00'
    },
    {
      id: '2',
      message: "Implement bulk document upload feature",
      status: 'in-progress',
      createdAt: '2024-03-10T14:20:00'
    },
    {
      id: '3',
      message: "Add calendar integration for meetings",
      status: 'pending',
      createdAt: '2024-03-05T09:15:00'
    }
  ])
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
    gender: "Male",
    languages: ["English", "Hindi"],
    joinedDate: "Feb 14, 2024"
  })
  const [satisfied, setSatisfied] = useState<boolean | undefined>()
  const [feedbackText, setFeedbackText] = useState("")

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "account", label: "My Account" },
    { id: "support", label: "Support" },
    { id: "feedback", label: "Feedback" },
    { id: "feature", label: "Feature Request" },
    { id: "privacy", label: "Privacy Policy" },
    { id: "delete", label: "Delete Account" },
    { id: "logout", label: "Logout" }
  ]

  const getStatusColor = (status: FeedbackEntry['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'in-progress':
        return 'bg-muted text-muted-foreground border-muted-foreground/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
  }

  const handleLogout = () => {
    signOut()
    onOpenChange(false)
  }

  const handleSubmitFeature = () => {
    toast({
      title: "Feature request submitted",
      description: "Thank you for your feedback. We'll review your request shortly.",
    })
    setFeatureRequest("")
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted.",
      variant: "destructive"
    })
    onOpenChange(false)
  }

  const handleFeedbackSubmit = () => {
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!",
    })
    setSatisfied(undefined)
    setFeedbackText("")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <Card className="border-none bg-[#1a1a1a]">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{`${profileData.firstName} ${profileData.lastName}`}</h3>
                    <p className="text-sm text-muted-foreground">{profileData.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input 
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input 
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input 
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select 
                        value={profileData.gender}
                        onValueChange={(value) => setProfileData(prev => ({...prev, gender: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Preferred Languages (up to 3)</Label>
                      <div className="flex flex-wrap gap-2">
                        
                        {profileData.languages.length < 3 && (
                          <Select
                            onValueChange={(value) => {
                              if (!profileData.languages.includes(value)) {
                                setProfileData(prev => ({
                                  ...prev,
                                  languages: [...prev.languages, value]
                                }))
                              }
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Add language" />
                            </SelectTrigger>
                            <SelectContent>
                              {["English", "Hindi", "Spanish", "French", "German"]
                                .filter(lang => !profileData.languages.includes(lang))
                                .map(lang => (
                                  <SelectItem key={lang} value={lang}>
                                    {lang}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                        {profileData.languages.map((lang) => (
                          <Badge key={lang} className="bg-muted">
                            {lang}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-transparent"
                              onClick={() => setProfileData(prev => ({
                                ...prev,
                                languages: prev.languages.filter(l => l !== lang)
                              }))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setIsEditing(false)} className="w-full">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Email:</span> {profileData.email}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Phone:</span> {profileData.phone}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Gender:</span> {profileData.gender}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Preferred Languages:</span>{" "}
                    {profileData.languages.join(", ")}
                  </p>
                  <div className="text-xs pt-4">
                    <span className="text-muted-foreground">On Daftar Since <br/> {profileData.joinedDate}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )

      case "support":
        return (
          <Card className="border-none bg-[#1a1a1a] p-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We're in the process of setting up our ticket system, but for now, feel free to reach out to us at support@daftaros.com. Our tech team will get back to you as soon as possible.
              </p>
            </div>
          </Card>
        )

      case "feedback":
        return (
          <Card className="border-none bg-[#1a1a1a] p-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm">Are you happy with us?</p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className={cn(
              
                      satisfied === true && "bg-muted"
                    )}
                    onClick={() => setSatisfied(true)}
                  >
                    Yes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className={cn(
                      
                      satisfied === false && "bg-muted"
                    )}
                    onClick={() => setSatisfied(false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>How can we make your experience better?</Label>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>

              <Button 
                disabled={satisfied === undefined || !feedbackText.trim()}
                onClick={handleFeedbackSubmit}
              >
                Submit Feedback
              </Button>
            </div>
          </Card>
        )

      case "feature":
        return (
          <Card className="border-none bg-[#1a1a1a] p-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Describe the feature you'd like to see..."
                value={featureRequest}
                onChange={(e) => setFeatureRequest(e.target.value)}
              />
              <Button onClick={handleSubmitFeature} disabled={!featureRequest.trim()}>
                Submit Request
              </Button>
            </div>
          </Card>
        )

      case "privacy":
        return (
          <Card className="border-none bg-[#1a1a1a] p-4">
            <div className="space-y-6">
              {privacySections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <h4 className="font-medium">{section.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{section.content}</p>
                </div>
              ))}
            </div>
          </Card>
        )

      case "delete":
        return (
          <Card className="border-none bg-[#1a1a1a] p-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Warning: This action cannot be undone. All your data will be permanently deleted.
              </p>
              <Button 
                variant="outline" 
                onClick={handleDeleteAccount}
              >
                Delete
              </Button>
            </div>
          </Card>
        )

      case "logout":
        return (
          <Card className="border-none bg-[#1a1a1a] p-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to logout?
              </p>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </Card>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex gap-0">
        <div className="w-[200px] border-r bg-[#0e0e0e]">
          <div className="flex flex-col space-y-1 p-4">
            <DialogHeader className="mb-4">
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-muted/50",
                  activeTab === tab.id ? "bg-muted" : "transparent"
                )}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 bg-[#0e0e0e] pt-10">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {renderContent()}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const privacySections = [
  {
    title: "Data Collection",
    icon: Database,
    content: "We collect information that you provide directly to us, including your name, email address, and any other information you choose to provide."
  },
  {
    title: "Use of Information",
    icon: Settings,
    content: "We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect our platform."
  },
  {
    title: "Data Sharing",
    icon: Share2,
    content: "We do not share your personal information with third parties except as described in this policy."
  },
  {
    title: "Security",
    icon: Shield,
    content: "We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access."
  }
] 