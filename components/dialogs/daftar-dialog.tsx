"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  MinusCircle
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

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  designation: string
  status: 'pending' | 'active'
  avatar?: string
}

interface DeletionApproval {
  memberId: string
  memberName: string
  designation: string
  status: 'not_requested' | 'pending' | 'approved' | 'rejected'
  date?: string
}

interface DaftarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navItems = [
  { title: "Profile", value: "profile", icon: UserCircle },
  { title: "Team", value: "team", icon: Users },
  { title: "Billing", value: "billing", icon: CreditCard },
  { title: "Delete Daftar", value: "delete", icon: Trash2 }
]

const dummyTeamMembers: Member[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    designation: "Chief Executive Officer",
    status: 'active',
    avatar: "/avatars/john.png"
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Smith",
    email: "sarah.smith@company.com",
    designation: "Chief Technology Officer",
    status: 'active',
    avatar: "/avatars/sarah.png"
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.j@company.com",
    designation: "Head of Operations",
    status: 'active',
    avatar: "/avatars/michael.png"
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.brown@company.com",
    designation: "Product Manager",
    status: 'active',
    avatar: "/avatars/emily.png"
  }
]

export function DaftarDialog({ open, onOpenChange }: DaftarDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [members, setMembers] = useState<Member[]>(dummyTeamMembers)
  const [pendingMembers, setPendingMembers] = useState<Member[]>([])
  const [newMember, setNewMember] = useState<Partial<Member>>({})
  const [showAddMember, setShowAddMember] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("/assets/daftar.png")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showDeletionApprovals, setShowDeletionApprovals] = useState(false)
  const [deletionApprovals, setDeletionApprovals] = useState<DeletionApproval[]>([])
  
  const handleSave = (tab: string) => {
    toast({
      title: "Changes saved",
      description: `Your ${tab} changes have been saved successfully.`
    })
    if (tab === "profile") {
      setIsEditing(false)
    }
    if (tab === "team" && showAddMember && newMember.firstName && newMember.lastName && newMember.email) {
      setPendingMembers([...pendingMembers, {
        id: Date.now().toString(),
        firstName: newMember.firstName || '',
        lastName: newMember.lastName || '',
        email: newMember.email || '',
        designation: newMember.designation || '',
        status: 'pending'
      }])
      setNewMember({})
      setShowAddMember(false)
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${newMember.email}`
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

  const handleApproveMember = (member: Member) => {
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

        <ScrollArea className="h-[calc(600px-3.5rem)]">
          {activeTab === "profile" && (
            <div className="p-6">
              <div className="grid grid-cols-3 gap-8">
                {/* Daftar Logo/Image */}
                <div className="space-y-4">
                  <div className="p-6 rounded-lg space-y-4 bg-card">
                    <div className="flex justify-center">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>DF</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-2 text-left">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Photo
                      </Button>
                      <Button
                        onClick={() => {
                          if (isEditing) {
                            handleSave("profile")
                          } else {
                            setIsEditing(true)
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        {isEditing ? "Save Changes" : "Edit Details"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Daftar Details */}
                <div className="col-span-2 space-y-6">
                  <h2 className="text-lg font-semibold">Daftar Details</h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Daftar Name</Label>
                        <Input 
                          disabled={!isEditing} 
                          placeholder="Enter daftar name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Structure</Label>
                        <Select disabled={!isEditing}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select structure" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="llc">LLC</SelectItem>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Team Size</Label>
                        <Select disabled={!isEditing}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 members</SelectItem>
                            <SelectItem value="11-50">11-50 members</SelectItem>
                            <SelectItem value="51-200">51-200 members</SelectItem>
                            <SelectItem value="201-500">201-500 members</SelectItem>
                            <SelectItem value="500+">500+ members</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input 
                          disabled={!isEditing} 
                          placeholder="Enter website URL"
                          type="url"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input 
                          disabled={!isEditing} 
                          placeholder="Enter location"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>What&apos;s the big picture you&apos;re working for?</Label>
                      <textarea
                        className={cn(
                          "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                        disabled={!isEditing}
                        placeholder="Describe your mission and vision..."
                      />
                    </div>

                    <div>
                        <span className="text-xs text-muted-foreground"><strong> On Daftar Since </strong> <br /> {formatDate(new Date().toISOString())}</span>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Team Members</h2>
                  <p className="text-sm text-muted-foreground">Manage your team members and their roles</p>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddMember}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              <div className="space-y-4">
                {showAddMember && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-medium">Add New Member</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={newMember.firstName || ""}
                          onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={newMember.lastName || ""}
                          onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                          placeholder="Enter last name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Designation</Label>
                        <Input
                          value={newMember.designation || ""}
                          onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                          placeholder="Enter designation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={newMember.email || ""}
                          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                          placeholder="Enter email address"
                          type="email"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={() => handleSave("team")}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Send Invitation
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pending Members Section */}
                {pendingMembers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Pending Invitations</h3>
                    {pendingMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.firstName} {member.lastName}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{member.designation}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingMembers(pendingMembers.filter(m => m.id !== member.id))}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active Members Section */}
                {members.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-muted-foreground">{member.designation}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {members.length === 0 && pendingMembers.length === 0 && !showAddMember && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No team members added yet
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave("team")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Billing & Subscription</h2>
                <p className="text-sm text-muted-foreground">Manage your billing information and subscription details</p>
              </div>

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
            </div>
          )}

          {activeTab === "delete" && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-destructive">Delete Daftar</h2>
                <p className="text-sm text-muted-foreground">Permanently delete your daftar and all associated data</p>
              </div>

              <div className="border border-destructive/20 rounded-lg p-6 space-y-6 bg-destructive/5">
                <div className="space-y-2">
                  <h3 className="font-medium text-destructive">Warning</h3>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. This will permanently delete your daftar account and remove all associated data from our servers.
                  </p>
                </div>

                <Button 
                  variant="destructive"
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={handleDeleteClick}
                >
                  Delete Daftar
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Team Member Approvals Required</h3>
                  <div className="text-sm text-muted-foreground">
                    {deletionApprovals.filter(a => a.status === 'approved').length} of {members.length} approved
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                            <p className="text-xs text-muted-foreground">{member.designation}</p>
                            <p className="text-xs text-muted-foreground">
                              {approval.status === 'not_requested' && 'Not requested yet'}
                              {approval.status === 'pending' && 'Awaiting response'}
                              {approval.status === 'approved' && approval.date && `Approved ${formatDate(approval.date)}`}
                              {approval.status === 'rejected' && 'Declined deletion request'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(approval.status)}
                        </div>
                      </div>
                    )
                  })}
                  <div className="">
                        <span className="text-xs text-muted-foreground"><strong> Deleted Daftar On </strong> <br /> {formatDate(new Date().toISOString())}</span>
                      </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 