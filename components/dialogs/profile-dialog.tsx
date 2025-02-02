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
import { Camera, Trash2, UserCircle, MessageSquarePlus, Shield, LogOut, Share2, Settings, Database } from "lucide-react"
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

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  language: string
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

const navItems = [
  { title: "Profile", value: "profile", icon: UserCircle },
  { title: "Feature Request", value: "feature", icon: MessageSquarePlus },
  { title: "Privacy Policy", value: "privacy", icon: Shield },
  { title: "Delete Account", value: "delete", icon: Trash2, className: "text-red-500 hover:text-red-600" },
]

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [featureRequest, setFeatureRequest] = useState("")
  
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
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
  }

  const handleSubmitFeature = () => {
    toast({
      title: "Feature request submitted",
      description: "Thank you for your feedback. We'll review your request shortly.",
    })
    setFeatureRequest("")
  }

  const handleProfileSave = () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0">
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
                    : "text-muted-foreground hover:text-foreground",
                  item.className
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

        <ScrollArea className="h-[calc(600px-3.5rem)]">
          {activeTab === "profile" && (
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                <div className="text-center space-y-2 mb-8">
                  <UserCircle className="h-8 w-8 mx-auto text-blue-500" />
                  <h2 className="text-2xl font-semibold">Profile Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your account settings and preferences
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {/* Profile Photo Card */}
                  <div className="space-y-4">
                    <div className="p-6 border rounded-lg space-y-4 bg-card">
                      <div className="flex justify-center">
                        <Avatar className="h-32 w-32 border-4 border-background">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>UN</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full relative overflow-hidden"
                          size="sm"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                          <input 
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                          />
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false)
                            signOut()
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Personal Information</h3>
                      <Button
                        onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className={cn(
                          isEditing && "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                      >
                        {isEditing ? "Save Changes" : "Edit Profile"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input disabled={!isEditing} defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input disabled={!isEditing} defaultValue="Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input disabled={!isEditing} defaultValue="john@example.com" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input disabled={!isEditing} defaultValue="+1234567890" />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input disabled={!isEditing} defaultValue="Acme Inc" />
                      </div>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input disabled={!isEditing} defaultValue="CEO" />
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
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input disabled={!isEditing} defaultValue="New York" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "feature" && (
            <div className="p-6">
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                  <MessageSquarePlus className="h-8 w-8 mx-auto text-blue-500" />
                  <h2 className="text-2xl font-semibold">Feature Request</h2>
                  <p className="text-sm text-muted-foreground">
                    Help us improve by suggesting new features or improvements
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-8">
                  {/* Left Section: New Request */}
                  <div className="col-span-3 space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 text-blue-500">
                          <MessageSquarePlus className="h-4 w-4" />
                          <p className="text-sm font-medium">Before submitting:</p>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                          <li className="list-disc">Check if the feature already exists</li>
                          <li className="list-disc">Be specific about the problem you're trying to solve</li>
                          <li className="list-disc">Include use cases where possible</li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Your Request</Label>
                        <Textarea
                          placeholder="Describe the feature you'd like to see..."
                          value={featureRequest}
                          onChange={(e) => setFeatureRequest(e.target.value)}
                          className="h-[200px] resize-none"
                        />
                        <div className="flex justify-end">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!featureRequest.trim()}
                            onClick={handleSubmitFeature}
                          >
                            <MessageSquarePlus className="h-4 w-4 mr-2" />
                            Submit Request
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Request History */}
                  <div className="col-span-2 border-l pl-8 space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Request Status</h3>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-green-500/10">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="text-green-500">Completed</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-500/10">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          <span className="text-blue-500">In Progress</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-yellow-500/10">
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                          <span className="text-yellow-500">Pending</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium">Previous Requests</h3>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                          {feedbackHistory.map((feedback) => (
                            <div
                              key={feedback.id}
                              className="p-4 border rounded-lg hover:border-blue-500/50 transition-colors space-y-2"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-sm leading-relaxed">{feedback.message}</p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "shrink-0",
                                    getStatusColor(feedback.status)
                                  )}
                                >
                                  {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                                <span>
                                  {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="p-6">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <Shield className="h-8 w-8 mx-auto text-blue-500" />
                  <h2 className="text-2xl font-semibold">Privacy Policy</h2>
                  <p className="text-sm text-muted-foreground">
                    Last updated: January 1, 2024
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {privacySections.map((section, index) => (
                    <div
                      key={section.title}
                      className="p-6 border rounded-lg space-y-3 bg-card"
                    >
                      <h3 className="font-medium flex items-center gap-2 text-blue-500">
                        <section.icon className="h-4 w-4" />
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
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
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                    <Trash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-red-500">Delete Account</h2>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. All your data will be permanently removed.
                  </p>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-red-500">
                    <Shield className="h-4 w-4" />
                    <p className="text-sm font-medium">Before proceeding:</p>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                    <li className="list-disc">All your scout will be removed</li>
                    <li className="list-disc">Your profile data will be deleted</li>
                    <li className="list-disc">Access to all services will be terminated</li>
                    <li className="list-disc">This action is irreversible</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Permanently Delete Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("profile")}
                  >
                    Cancel
                  </Button>
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