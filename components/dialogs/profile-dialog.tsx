"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
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

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [featureRequest, setFeatureRequest] = useState("")
  const [selectedDaftar, setSelectedDaftar] = useState<string>("")
  const [designations, setDesignations] = useState<DaftarDesignation>({})

  // Sample feedback history - in real app, this would come from an API
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

  const getStatusColor = (status: FeedbackEntry['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'in-progress':
        return 'bg-muted-ftext-muted-foreground/10 text-muted-foreground border-muted-ftext-muted-foreground/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
  }
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const handleSubmitFeature = () => {
    toast({
      title: "Feature request submitted",
      description: "Thank you for your feedback. We'll review your request shortly.",
    })
    setFeatureRequest("")
  }

  const handleProfileSave = () => {
    console.log('Saving designations:', designations);
    
    toast({
      title: "Profile updated",
      description: "Your profile changes have been saved successfully.",
    })
    setIsEditing(false)
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted.",
      variant: "destructive"
    })
    onOpenChange(false)
  }

  const handleDaftarChange = (daftarId: string) => {
    setSelectedDaftar(daftarId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-w-4xl h-[500px] p-0 gap-0">
        {/* Top Navigation */}
        <div className="border-b">
          <nav className="flex items-center space-x-1 px-4 h-14">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={cn(
                  "relative px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-accent/50",
                  activeTab === item.value
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </span>
                {activeTab === item.value && (
                  <span className="absolute inset-x-0 -bottom-[10px] h-[2px] bg-foreground" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <ScrollArea className="h-[calc(500px-3.5rem)]">
          {activeTab === "profile" && (
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-3 gap-8">
                  {/* Profile Photo Card */}
                  <div className="space-y-4">
                    <div className="p-6 rounded-lg space-y-4 bg-card">
                      <div className="flex justify-center">
                        <Avatar className="h-32 w-32 ">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>UN</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="space-y-2 text-left">
                        <Button
                          variant="outline"
                          className="w-full text-left relative overflow-hidden"
                          size="sm"
                        >
                          <span>Change Photo</span>
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                          />
                        </Button>
                        <Button
                          onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
                          variant="outline"
                          size="sm"
                          className={cn(
                            'w-full text-left',
                            isEditing && " text-white"
                          )}
                        >
                          {isEditing ? "Save Changes" : "Edit Profile"}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false)
                            signOut()
                          }}
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="col-span-2 space-y-6">

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input disabled={!isEditing} defaultValue="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input disabled={!isEditing} defaultValue="john@example.com" type="email" />
                      </div>
                      <div className="space-y-2 w-full">
                        <Label>Phone</Label>
                        <Input disabled={!isEditing} defaultValue="+1234567890" />
                      </div>
                    
                      <div className="space-y-2">
                        <Label>Daftar</Label>
                        <Select 
                          disabled={!isEditing} 
                          value={selectedDaftar}
                          onValueChange={handleDaftarChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Daftar" />
                          </SelectTrigger>
                          <SelectContent>
                            {daftarOptions.map((daftar) => (
                              <SelectItem key={daftar.id} value={daftar.id}>
                                {daftar.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Designation</Label>
                        <Input 
                          disabled={!isEditing || !selectedDaftar}
                          value={designations[selectedDaftar] || ''}
                          onChange={(e) => 
                            setDesignations(prev => ({
                              ...prev,
                              [selectedDaftar]: e.target.value
                            }))
                          }
                          placeholder={selectedDaftar ? "Enter designation" : "Select a Daftar first"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Age</Label>
                        <Input disabled={!isEditing} defaultValue="25" />
                      </div>

                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select disabled={!isEditing}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Languages</Label>
                        <Combobox
                          options={[
                            "English",
                            "Spanish",
                            "French",
                            "German",
                            "Italian",
                            "Portuguese",
                            "Russian",
                            "Chinese",
                            "Hindi",
                            "Tamil",
                            "Telugu",
                            "Malay",
                            "Arabic",
                            "Japanese",
                            "Korean",
                            "Thai",
                            "Indonesian",
                          ]}
                          disabled={!isEditing}
                          onSelect={(value) => {
                            console.log(value);

                            if (!selectedLanguages.includes(value)) {
                              setSelectedLanguages([...selectedLanguages, value]);
                            }
                          }}
                          placeholder="Choose your preferred language"
                        />

                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedLanguages.map((language) => (
                            <Badge
                              key={language}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-muted"
                              onClick={() => {
                                if (isEditing) {
                                  setSelectedLanguages((prev) => prev.filter((s) => s !== language))
                                }
                              }}
                            >
                              {language} <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="">
                        <span className="text-xs text-muted-foreground"><strong> On Daftar Since </strong> <br /> {formatDate(new Date().toISOString())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "feature" && (
            <div className="p-6 mx-auto h-full">
              <div className="flex flex-col gap-3 justify-center h-full ">
                <Label className="text-sm font-medium">Your Request</Label>
                <Textarea
                  placeholder="Describe the feature you'd like to see. (max. 200 characters)"
                  value={featureRequest}
                  onChange={(e) => setFeatureRequest(e.target.value)}
                  className="h-[200px] resize-none"
                />
                <div className="flex w-full ">
                  <Button
                    className="bg-muted hover:bg-muted/50 w-full text-white"
                    disabled={!featureRequest.trim()}
                    onClick={handleSubmitFeature}
                  >
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="p-6">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="grid grid-cols-2  gap-8">
                  {privacySections.map((section, index) => (
                    <div
                      key={section.title}
                      className="p-6 border rounded-lg space-y-3 bg-card"
                    >
                      <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
                        <section.icon className="h-4 w-4" />
                        {section.title}
                      </h3>
                      <p className="text-sm text-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "delete" && (
            <div className="p-6">
              <div className="max-w-md mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-full  flex items-center justify-center mx-auto">
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone.
                    <br />
                    All your data will be permanently removed.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="bg-muted hover:bg-muted/50"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("profile")}
                  >
                    Withdraw                  </Button>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
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