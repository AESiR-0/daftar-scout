"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, UserMinus, Trash2, Loader2, Languages, Phone, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Daftar } from "@/lib/dummy-data/daftars"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  daftarData: Daftar | null
  daftarId?: string
  onLeaveTeam?: () => void;
  onWithdrawInvite?: (email: string) => void;
  preferredLanguage?: string;
  age?: string;
  phoneNumber?: string;
  gender?: 'Male' | 'Female' | 'Other' | '';
}

interface TeamMemberDetails {
  preferredLanguage: string
  age: string
  gender: 'Male' | 'Female' | 'Other' | ''
  phoneNumber: string
}

export function TeamDialog({ open, daftarData, onOpenChange, daftarId }: TeamDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    email: "",
    age: "",
    gender: "" as TeamMemberDetails['gender'],
    phoneNumber: ""
  })
  // const { inviteTeamMember } = api.founderTeam
  const [isInviting, setIsInviting] = useState(false)
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)
  const [showLeaveConfirmDialog, setShowLeaveConfirmDialog] = useState(false)

  // Get all team members without owner distinction
  const teamMembers = daftarData ? [
    ...daftarData.team.members
  ] : []

  const pendingInvites = daftarData?.pendingInvites || []

  const handleSendInvite = async () => {
    setIsInviting(true)
    try {
      // const response = await inviteTeamMember({
      //   pitch_id: 1,
      //   first_name: formData.firstName,
      //   last_name: formData.lastName,
      //   designation: formData.designation,
      //   email: formData.email
      // })

      toast({
        title: "Team member invited successfully!",
        description: `Invitation sent to ${formData.email}`,
        variant: "success",
      })
      setFormData({
        firstName: "",
        lastName: "",
        designation: "",
        email: "",
        age: "",
        gender: "" as TeamMemberDetails['gender'],
        phoneNumber: ""
      })
      onOpenChange(false)
      window.location.reload()

    } catch (error) {
      console.error("Error inviting team member:", error)
      toast({
        title: "Error inviting team member",
        description: (error as Error).message,
        variant: "error"
      })
    } finally {
      setIsInviting(false)
    }
  }

  const isFormValid = formData.firstName &&
    formData.lastName &&
    formData.designation &&
    formData.email

  const handleRemoveMember = (memberEmail: string) => {
    setMemberToRemove(memberEmail)
    setShowConfirmDialog(true)
  }

  const confirmRemoveMember = () => {
    if (!memberToRemove || !daftarData) return

    daftarData.team.members = daftarData.team.members.filter(member => member.email !== memberToRemove)

    toast({
      title: "Team member removed",
      description: `${memberToRemove} has been removed from the team`,
      variant: "success",
    })
    setShowConfirmDialog(false)
    setMemberToRemove(null)
  }

  const handleWithdrawInvite = (inviteEmail: string) => {
    if (!daftarData) return

    daftarData.pendingInvites = daftarData.pendingInvites?.filter(invite => invite.email !== inviteEmail)

    toast({
      title: "Invite withdrawn",
      description: `The invite to ${inviteEmail} has been withdrawn`,
      variant: "success",
    })
  }

  const handleLeaveTeam = () => {
    toast({
      title: "Left team successfully",
      description: "You have been removed from the team",
      variant: "success",
    })
    onOpenChange(false)
    // Here you would typically redirect to a different page or update the UI
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className="px-6 pt-6"> </DialogTitle>

        <DialogContent className="max-w-3xl h-2/3">
          <Tabs defaultValue="team" className="w-full h-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="team" className="flex items-center gap-1">
                  Team Members
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.3rem]">
                    {teamMembers.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-1">
                  Pending Invites
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.3rem]">
                    {pendingInvites.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="leave" className="text-red-600">
                  Leave Team
                </TabsTrigger>
              </TabsList>
            </div>
            <ScrollArea className="h-[calc(100%-4rem)]">
              <TabsContent value="team" className="mt-0 overflow-auto">
                <div className="grid grid-cols-2 gap-6">
                  {/* Team Members List */}
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.email}
                        className="p-4 rounded-[0.3rem] border space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{member.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {member.role}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveMember(member.email)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{member.phoneNumber || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Languages className="h-4 w-4 text-muted-foreground" />
                              <span>{member.preferredLanguage || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{member.gender || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Invite Form */}
                  <div className="p-4 rounded-[0.3rem] border space-y-4 h-fit">
                    <h3 className="font-medium">Invite Team Member</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="First Name"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                        <Input
                          placeholder="Last Name"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                      <Input
                        placeholder="Designation"
                        value={formData.designation}
                        onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm text-muted-foreground">Gender</label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value: TeamMemberDetails['gender']) =>
                              setFormData(prev => ({ ...prev, gender: value }))}
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
                        <Input
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        />
                      </div>
                      <Input
                        type="number"
                        placeholder="Age"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      />
                      <Button
                        onClick={handleSendInvite}
                        disabled={isInviting || !isFormValid}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isInviting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Invite...
                          </>
                        ) : (
                          'Send Invite'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-0 overflow-auto">
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.email}
                      className="p-4 rounded-[0.3rem] border flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">{invite.designation}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          Sent on {new Date(invite.sentAt).toLocaleDateString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleWithdrawInvite(invite.email)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="leave" className="mt-0">
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-red-600">Leave Team</h3>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to leave this team? This action cannot be undone.
                    </p>
                  </div>
                  <div className="space-y-2 rounded-md bg-red-500/10 p-4">
                    <p className="text-sm font-medium text-red-600">What happens when you leave:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>You will lose access to all team resources</li>
                      <li>Your contributions will remain with the team</li>
                      <li>You can be invited back by other team members</li>
                    </ul>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowLeaveConfirmDialog(true)}
                  >
                    Leave Team
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the team member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveMember}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showLeaveConfirmDialog} onOpenChange={setShowLeaveConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove you from the team. You will lose access to all team resources and ongoing projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveTeam}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, leave team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}