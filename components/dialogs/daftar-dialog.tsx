"use client"

import { useState, useRef, useEffect } from "react"
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
import { useDaftar } from "@/lib/context/daftar-context"

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

type DaftarTab = "details" | "team" | "delete"

// const privacySections = [
//   {
//     title: "Data Collection",
//     icon: Lock,
//     content: "We collect information you provide directly to us when you create your Daftar, including your name, contact information, and preferences."
//   },
//   {
//     title: "Data Usage",
//     icon: Share2,
//     content: "We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect our platform."
//   },
//   {
//     title: "Security",
//     icon: Shield,
//     content: "We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access."
//   }
// ]

interface DaftarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const getInitials = (name: string) => {
  const [firstName, lastName] = name.split(' ')
  return firstName?.[0] + (lastName?.[0] || '')
}

const formatPhoneNumber = (phone?: string) => {
  if (!phone) return '';
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
  // { id: "billing", label: "Billing", icon: CreditCard },
  // { id: "privacy", label: "Privacy Policy", icon: Shield },
  { id: "delete", label: "Delete Daftar", icon: Trash2 }
]

interface MemberCardProps {
  member: TeamMember
  onRemove?: (id: string) => void
}

function MemberCard({ member, onRemove }: MemberCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editDesignation, setEditDesignation] = useState("")
  const handleSaveDesignation = () => {
    setIsEditing(false)
  }
  const handleWithdraw = () => {
    // Handle withdraw logic
    console.log('Withdrawing from team')
  }

  return (
    <div className="bg-[#1a1a1a] py-6 rounded-[0.35rem]">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Avatar className="h-40 w-40 rounded-[0.35rem]">
            {member.imageUrl ? (
              <AvatarImage src={member.imageUrl} alt={member.firstName} className="rounded-[0.35rem]" />
            ) : (
              <AvatarFallback className="rounded-[0.35rem] text-xl">{getInitials(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
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
                  <p>{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>{formatDate(member.joinDate)}</p>
                </div>
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
              onClick={() => onRemove?.(member.id)}
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
  const daftarId = useDaftar().selectedDaftar
  const [activeTab, setActiveTab] = useState<DaftarTab>("details")
  const [isEditing, setIsEditing] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoadingTeam, setIsLoadingTeam] = useState(false)
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({})
  const [showAddMember, setShowAddMember] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("/assets/daftar.png")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showDeletionApprovals, setShowDeletionApprovals] = useState(false)
  const [deletionApprovals, setDeletionApprovals] = useState<DeletionApproval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [daftarData, setDaftarData] = useState({
    name: "",
    structure: "",
    code: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    },
    vision: "",
    joinedDate: new Date().toISOString()
  })
  const [userConsent, setUserConsent] = useState(false)

  // Fetch Daftar details
  useEffect(() => {
    const fetchDaftarDetails = async () => {
      try {
        const response = await fetch(`/api/endpoints/daftar/me?daftarId=${daftarId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch Daftar details')
        }
        const data = await response.json()
        setDaftarData({
          name: data.name || "",
          structure: data.structure || "",
          code: data.id || "",
          website: data.website || "",
          address: {
            street: "",
            city: "",
            state: "",
            country: "",
            postalCode: ""
          },
          vision: data.bigPicture || "",
          joinedDate: data.createdAt || new Date().toISOString()
        })
      } catch (error) {
        console.error('Error fetching Daftar details:', error)
        toast({
          title: "Error",
          description: "Failed to load Daftar details",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (open && daftarId) {
      fetchDaftarDetails()
    }
  }, [open, daftarId, toast])

  // Fetch team members
  const fetchTeamMembers = async () => {
    if (!daftarId) return;
    setIsLoadingTeam(true);
    try {
      const response = await fetch(`/api/endpoints/daftar/team?daftarId=${daftarId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTeam(false);
    }
  };

  // Fetch team members when tab changes to team
  useEffect(() => {
    if (activeTab === 'team' && open) {
      fetchTeamMembers();
    }
  }, [activeTab, open, daftarId]);

  const handleInviteMember = async () => {
    if (!daftarId || !newMember.email || !newMember.designation) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/endpoints/daftar/team?daftarId=${daftarId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newMember.email,
          designation: newMember.designation,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite team member');
      }

      toast({
        title: "Success",
        description: "Team member invited successfully"
      });
      setNewMember({});
      fetchTeamMembers(); // Refresh the team list
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite team member",
        variant: "destructive"
      });
    }
  };

  const handleCancelInvite = (id: string) => {
    setMembers(members.filter(member => member.id !== id))
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/endpoints/daftar/me?daftarId=${daftarId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: daftarData.name,
          structure: daftarData.structure,
          website: daftarData.website,
          vision: daftarData.vision,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update Daftar')
      }

      setIsEditing(false)
      toast({
        title: "Success",
        description: "Your daftar details have been updated successfully."
      })
      onSuccess()
    } catch (error) {
      console.error('Error updating Daftar:', error)
      toast({
        title: "Error",
        description: "Failed to update Daftar details",
        variant: "destructive"
      })
    }
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
    if (!daftarData.name || !daftarData.vision || !daftarData.structure) {
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

  const renderTeamContent = () => {
    if (isLoadingTeam) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading team members...</p>
          </div>
        </div>
      );
    }

    return (
      <Card className="border-none rounded-[0.35rem] bg-[#1a1a1a] p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Email"
              type="email"
              value={newMember.email || ''}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
            <Input
              placeholder="Designation"
              value={newMember.designation || ''}
              onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
            />
          </div>
          <Button
            onClick={handleInviteMember}
            className="w-full rounded-[0.35rem] bg-muted hover:bg-muted/50"
            disabled={!newMember.email || !newMember.designation}
          >
            Invite
          </Button>
        </div>

        <Tabs defaultValue="team" className="mt-6">
          <TabsList className="">
            <TabsTrigger value="team" className="flex-1">
              Team ({members.filter(m => m.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">
              Pending ({members.filter(m => m.status === 'pending').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="mt-4 space-y-3">
            {members.filter(m => m.status === 'active').map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onRemove={handleRemoveMember}
              />
            ))}
            {members.filter(m => m.status === 'active').length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No team members yet
              </p>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {members.filter(m => m.status === 'pending').map((member) => (
              <PendingCard key={member.id} member={member} />
            ))}
            {members.filter(m => m.status === 'pending').length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No pending invitations
              </p>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="border-none h-[450px] overflow-y-auto rounded-[0.35rem] bg-[#1a1a1a]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading Daftar details...</p>
            </div>
          </div>
        </Card>
      )
    }

    switch (activeTab) {
      case "details":
        return (
          <Card className="border-none h-[450px] overflow-y-auto rounded-[0.35rem] bg-[#1a1a1a]">
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
                    <div className="col-span-2 space-y-2">
                      <Label>Address</Label>
                      <div className="space-y-2">
                        <Input
                          placeholder="Street Address"
                          value={daftarData.address?.street}
                          onChange={(e) => setDaftarData(prev => ({
                            ...prev,
                            address: { ...prev.address, street: e.target.value }
                          }))}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="City"
                            value={daftarData.address?.city}
                            onChange={(e) => setDaftarData(prev => ({
                              ...prev,
                              address: { ...prev.address, city: e.target.value }
                            }))}
                          />
                          <Input
                            placeholder="State/Province"
                            value={daftarData.address?.state}
                            onChange={(e) => setDaftarData(prev => ({
                              ...prev,
                              address: { ...prev.address, state: e.target.value }
                            }))}
                          />
                          <Input
                            placeholder="Country"
                            value={daftarData.address?.country}
                            onChange={(e) => setDaftarData(prev => ({
                              ...prev,
                              address: { ...prev.address, country: e.target.value }
                            }))}
                          />
                          <Input
                            placeholder="Postal Code"
                            value={daftarData.address?.postalCode}
                            onChange={(e) => setDaftarData(prev => ({
                              ...prev,
                              address: { ...prev.address, postalCode: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>What's the big picture you're working on?</Label>
                      <Input
                        value={daftarData.vision}
                        onChange={(e) => setDaftarData(prev => ({ ...prev, vision: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full rounded-[0.35rem]">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Website:</span> {daftarData.website}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Address:</span>{" "}
                    {daftarData.address && (
                      <>
                        {daftarData.address.street},<br />
                        {daftarData.address.city}, {daftarData.address.state} {daftarData.address.postalCode},<br />
                        {daftarData.address.country}
                      </>
                    )}
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
        return renderTeamContent();

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
              className="rounded-[0.35rem]"
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