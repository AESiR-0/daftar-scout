"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import {
  UserCircle,
  Users,
  Settings,
  Plus,
  CreditCard,
  Trash2,
  X,
  Check,
  Clock,
  MinusCircle,
  Shield,
  Share2,
  Lock,
  Pencil
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import formatDate from "@/lib/formatDate"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "../ui/checkbox"

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  designation: string
  age: string
  gender: string
  location: string
  language: string[]
  imageUrl?: string
  status: 'active' | 'pending'
  isCurrentUser?: boolean
  joinDate: string
  phone: string
}

interface DeletionApproval {
  memberId: string
  memberName: string
  designation: string
  status: 'not_requested' | 'pending' | 'approved' | 'rejected'
  date?: string
}

type DaftarTab = "details" | "team" | "billing" | "delete" | "privacy"

const privacySections = [
  {
    title: "Data Collection",
    icon: Lock,
    content: "We collect information you provide directly to us when you create your Daftar, including your name, contact information, and preferences."
  },
  {
    title: "Data Usage",
    icon: Share2,
    content: "We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect our platform."
  },
  {
    title: "Security",
    icon: Shield,
    content: "We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access."
  }
]

interface DaftarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const navItems = [
  { title: "Profile", value: "profile", icon: UserCircle },
  { title: "Team", value: "team", icon: Users },
  { title: "Billing", value: "billing", icon: CreditCard },
  { title: "Delete Daftar", value: "delete", icon: Trash2 }
]
const getInitials = (name: string) => {
  const [firstName, lastName] = name.split(' ')
  return firstName?.[0] + (lastName?.[0] || '')
}

const formatPhoneNumber = (phone: string) => {
  // Match country code (anything from start until last 10 digits)
  const match = phone.match(/^(.+?)(\d{10})$/)
  if (match) {
    return `${match[1]} ${match[2]}`
  }
  return phone
}
const dummyTeamMembers: TeamMember[] = [
  {
    id: '1',
    firstName: 'Current',
    lastName: 'User',
    email: 'current@user.com',
    designation: 'Founder',
    age: '28',
    gender: 'Male',
    location: 'Dubai, UAE',
    language: ['English', 'Arabic'],
    status: 'active',
    isCurrentUser: true,
    joinDate: '2024-01-15',
    phone: '+971526374859'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Ahmed',
    email: 'sarah.ahmed@example.com',
    designation: 'CTO',
    age: '32',
    gender: 'Female',
    location: 'Abu Dhabi, UAE',
    language: ['English', 'Arabic', 'French'],
    status: 'active',
    joinDate: '2024-02-01',
    phone: '+971526374859'
  },
  {
    id: '3',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    designation: 'Product Manager',
    age: '30',
    gender: 'Male',
    location: 'Dubai, UAE',
    language: ['English', 'Spanish'],
    status: 'pending',
    joinDate: '2024-03-10',
    phone: '+971526374859'
  }
]

const tabs: { id: DaftarTab; label: string; icon: any }[] = [
  { id: "details", label: "Details", icon: UserCircle },
  { id: "team", label: "Team", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "privacy", label: "Privacy Policy", icon: Shield },
  { id: "delete", label: "Delete Daftar", icon: Trash2 }
]

interface MemberCardProps {
  member: TeamMember
  onRemove?: (id: string) => void
}

function MemberCard({ member, onRemove }: MemberCardProps) {
  const [members, setMembers] = useState<TeamMember[]>(dummyTeamMembers)
  const [isEditing, setIsEditing] = useState(false)
  const [editDesignation, setEditDesignation] = useState("")
  const handleSaveDesignation = () => {
    setIsEditing(false)
  }
  const handleWithdraw = () => {
    // Handle withdraw logic
    console.log('Withdrawing from team')
  }

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id))
  }

  return (
    <div className="bg-[#1a1a1a] py-6 rounded-[0.35rem]">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Avatar className="h-40 w-40 rounded-[0.35rem]">
            {member.imageUrl ? (
              <AvatarImage src={member.imageUrl} alt={member.firstName} className="rounded-[0.35rem]" />
            ) : (
              <AvatarFallback className="rounded-[0.35rem] text-xl">{getInitials(member.firstName)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-md font-medium">{member.firstName} {member.lastName}</h4>
            </div>

            <div className="space-y-2 mt-2">
              <div className="space-y-1 text-xs text-muted-foreground">
                {isEditing && member.isCurrentUser ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="h-8"
                      placeholder="Enter your designation"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveDesignation}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{member.designation}</p>
                )}
                <div className="flex items-center gap-2">
                  <span>{member.age}</span>
                  <span>{member.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p>{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>{formatPhoneNumber(member.phone)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>{member.location}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Preferred languages to connect with founders: {member.language.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {member.isCurrentUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {member.isCurrentUser ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWithdraw}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMember(member.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function PendingCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-medium">
            {member.firstName} {member.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{member.designation}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>
      <Button variant="outline" size="icon">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

const languages = [
  "English",
  "Hindi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Kannada",
  "Malayalam"
]

export function DaftarDialog({
  open,
  onOpenChange,
  onSuccess,
}: DaftarDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<DaftarTab>("details")
  const [isEditing, setIsEditing] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>(dummyTeamMembers)
  const [pendingMembers, setPendingMembers] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({})
  const [showAddMember, setShowAddMember] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("/assets/daftar.png")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showDeletionApprovals, setShowDeletionApprovals] = useState(false)
  const [deletionApprovals, setDeletionApprovals] = useState<DeletionApproval[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
  })
  const [daftarData, setDaftarData] = useState({
    name: "My Daftar",
    structure: "Government Incubator",
    code: "A7B2X9",
    website: "www.example.com",
    location: "Mumbai, India",
    vision: "Building the next generation of financial infrastructure",
    joinedDate: new Date().toISOString()
  })
  const [userConsent, setUserConsent] = useState(false)

  const handleCancelInvite = (id: string) => {
    setMembers(members.filter(member => member.id !== id))
  }



  const handleSave = () => {
    setIsEditing(false)
    toast({
      title: "Changes saved",
      description: "Your daftar details have been updated successfully."
    })
  }

  const handleAddMember = () => {
    setShowAddMember(true)
  }


  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id))
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setAvatarUrl(imageUrl)
      toast({
        title: "Photo updated",
        description: "Your daftar photo has been updated successfully."
      })
    }
  }

  const handleApproveMember = (member: TeamMember) => {
    setMembers([...members, { ...member, status: 'active' }])
    setPendingMembers(pendingMembers.filter(m => m.id !== member.id))
    toast({
      title: "Member approved",
      description: `${member.firstName} ${member.lastName} has been added to the team`
    })
  }

  const handleDeleteClick = () => {
    setShowDeletionApprovals(true)
    const approvals = members.map(member => ({
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      designation: member.designation,
      status: 'pending' as const
    }))
    setDeletionApprovals(approvals)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <X className="h-5 w-5 text-destructive" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <MinusCircle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.type) {
      toast({
        title: "Please fill all fields",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Daftar created successfully",
      description: "You can now start scouting startups"
    })
  }

  const renderContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a]">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 rounded-[0.35rem]">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>D</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{daftarData.name}</h3>
                    <p className="text-sm text-muted-foreground">{daftarData.structure}</p>
                    <p className="text-xs text-muted-foreground mt-1">Daftar Code: {daftarData.code}</p>
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
                      <Label>Daftar Name</Label>
                      <Input
                        value={daftarData.name}
                        onChange={(e) => setDaftarData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Structure</Label>
                      <Select
                        value={daftarData.structure}
                        onValueChange={(value) => setDaftarData(prev => ({ ...prev, structure: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select structure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Government Incubator">Government Incubator</SelectItem>
                          <SelectItem value="Private Incubator">Private Incubator</SelectItem>
                          <SelectItem value="Angel Network">Angel Network</SelectItem>
                          <SelectItem value="Venture Capital">Venture Capital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={daftarData.website}
                        onChange={(e) => setDaftarData(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={daftarData.location}
                        onChange={(e) => setDaftarData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>What's the big picture you're working on?</Label>
                      <Input
                        value={daftarData.vision}
                        onChange={(e) => setDaftarData(prev => ({ ...prev, vision: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Website:</span> {daftarData.website}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Location:</span> {daftarData.location}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">The big picture we are working on:</span> <br/>{daftarData.vision}
                  </p>
                  <div className="text-xs pt-4">
                    <span className="text-muted-foreground">On Daftar Since <br /> {formatDate(daftarData.joinedDate)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )

      case "team":
        return (
          <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
            {/* Invite Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={newMember.firstName}
                  onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                />
                <Input
                  placeholder="Last Name"
                  value={newMember.lastName}
                  onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                />
                <Input
                  placeholder="Designation"
                  value={newMember.designation}
                  onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                />
                
                <Input
                  placeholder="Email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <Button
                onClick={() => {
                  if (newMember.firstName && newMember.lastName && newMember.email && newMember.designation) {
                    setPendingMembers([...pendingMembers, { 
                      ...newMember as TeamMember, 
                      id: Math.random().toString(),
                      status: 'pending'
                    }])
                    setNewMember({})
                    toast({
                      title: "Invitation sent",
                      description: "Team member will be added once they accept the invitation"
                    })
                  }
                }}
                className="w-full bg-muted hover:bg-muted/50"
                disabled={!newMember.firstName || !newMember.lastName || !newMember.email || !newMember.designation}
              >
                Invite
              </Button>
            </div>

            {/* Tabs and Members List */}
            <Tabs defaultValue="team" className="mt-6">
              <TabsList className="">
                <TabsTrigger value="team" className="flex-1">
                  Team ({members.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">
                  Pending ({pendingMembers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="team" className="mt-4 space-y-3">
                {members.map((member) => (
                  <MemberCard 
                    key={member.id} 
                    member={member} 
                    onRemove={handleRemoveMember}
                  />
                ))}
                {members.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No team members yet
                  </p>
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-4 space-y-3">
                {pendingMembers.map((member) => (
                  <PendingCard key={member.id} member={member} />
                ))}
                {pendingMembers.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No pending invitations
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )

      case "billing":
        return (
          <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
            <div className="border rounded-lg p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Current Plan</h3>
                <p className="text-sm text-muted-foreground">Free Plan</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Billing Information</h3>
                <p className="text-sm text-muted-foreground">No billing information added</p>
              </div>

              <Button variant="outline">
                Upgrade Plan
              </Button>
            </div>
          </Card>
        )

      case "privacy":
        return (
          <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
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
          <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
            <div className="space-y-4 mb-4">
              <p className="text-sm text-muted-foreground">All data related to the Daftar will be deleted, and the offer will be withdrawn. An email will be sent to all stakeholders to notify them of this change.</p>
            </div>
            <div className="flex items-start gap-2 mb-4">
              <Checkbox
                id="user-consent"
                checked={userConsent}
                onCheckedChange={(checked) => setUserConsent(checked as boolean)}
                className="h-5 w-5 mt-0.5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              />
              <label
                htmlFor="user-consent"
                className="text-sm text-muted-foreground"
              >
                I agree to delete the Daftar
              </label>
            </div>

              <Button
                variant="outline"
                onClick={handleDeleteClick}
              >
                Delete
              </Button>


            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Team&apos;s Approval Required</h3>
                <div className="text-sm text-muted-foreground">
                  {deletionApprovals.filter(a => a.status === 'approved').length} of {members.length}
                </div>
              </div>

              <div>
                {members.map((member) => {
                  const approval = deletionApprovals.find(a => a.memberId === member.id) || {
                    status: 'not_requested',
                    date: undefined
                  }

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(approval.status)}
                      </div>
                    </div>
                  )
                })}
                <div className="pt-4">
                  <span className="text-xs text-muted-foreground"><strong> Deleted Daftar On </strong> <br /> {formatDate(new Date().toISOString())}</span>
                </div>
              </div>
            </div>
          </Card>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-2 bg-background">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-[200px] border-r">
            <DialogHeader className="px-3 py-2">
              <DialogTitle>Daftar</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[450px]">
              <div className="p-3 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full p-2 text-left text-sm rounded-md transition-colors flex items-center gap-2",
                      activeTab === tab.id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <ScrollArea className="h-[450px]">
              {renderContent()}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 