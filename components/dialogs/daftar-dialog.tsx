"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  UserCircle,
  Users,
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Languages,
  Settings,
  Plus
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

interface Member {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface DaftarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navItems = [
  { title: "Profile", value: "profile", icon: UserCircle },
  { title: "Team", value: "team", icon: Users },
  { title: "Settings", value: "settings", icon: Settings },
]

export function DaftarDialog({ open, onOpenChange }: DaftarDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [newMember, setNewMember] = useState<Partial<Member>>({})
  const [showAddMember, setShowAddMember] = useState(false)
  
  const handleSave = (tab: string) => {
    toast({
      title: "Changes saved",
      description: `Your ${tab} changes have been saved successfully.`
    })
    if (tab === "profile") {
      setIsEditing(false)
    }
    if (tab === "team" && showAddMember && newMember.name && newMember.email) {
      setMembers([...members, {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        role: newMember.role || "Member"
      }])
      setNewMember({})
      setShowAddMember(false)
    }
  }

  const handleAddMember = () => {
    setShowAddMember(true)
  }

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id))
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
                  <div className="p-6 border rounded-lg space-y-4">
                    <div className="flex justify-center">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src="/assets/daftar.png" />
                        <AvatarFallback>DF</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-medium">Daftar Name</h3>
                      <p className="text-sm text-muted-foreground">Created on Jan 1, 2024</p>
                    </div>
                  </div>
                </div>

                {/* Daftar Details */}
                <div className="col-span-2 space-y-6">
                  <div className="flex w-full  justify-center items-center">
                    <h2 className="text-lg font-semibold">Daftar Details</h2>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      size="sm"
                    >
                      {isEditing ? "Save Changes" : "Edit Details"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input disabled={!isEditing} defaultValue="Daftar Name" />
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
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select disabled={!isEditing}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="health">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
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
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => handleSave("profile")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
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
                        <Label>Name</Label>
                        <Input
                          value={newMember.name || ""}
                          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                          placeholder="Enter member name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={newMember.email || ""}
                          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                          placeholder="Enter member email"
                          type="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={newMember.role}
                          onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{member.role}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                {members.length === 0 && !showAddMember && (
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

          {activeTab === "settings" && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Daftar Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your Daftar preferences and configurations</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notifications</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All notifications</SelectItem>
                      <SelectItem value="important">Important only</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => handleSave("settings")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 