"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, Languages, Loader2, UserMinus, Trash2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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

interface TeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  daftarData: Daftar | null
  daftarId?: string
}

export function TeamDialog({ open, daftarData, onOpenChange, daftarId }: TeamDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    email: ""
  })
  // const { inviteTeamMember } = api.founderTeam
  const [isInviting, setIsInviting] = useState(false)
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)

  // Update teamMembers when daftarData changes
  const teamMembers = daftarData ? [
    { name: daftarData.team.owner, role: "Owner", email: `${daftarData.team.owner.toLowerCase().replace(' ', '.')}@example.com` },
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
        email: ""
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
  const [isOwner, setIsOwner] = useState(true)
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className="px-6 pt-6"> </DialogTitle>

        <DialogContent className="max-w-3xl h-2/3">
          <Tabs defaultValue="team" className="w-full h-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="team" className="flex items-center gap-1">
                  Team
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.3rem]">
                    {teamMembers.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-1">
                  Pending
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.3rem]">
                    {pendingInvites.length}
                  </span>
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
                          {isOwner && member.role !== "Owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveMember(member.email)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{member.email}</span>
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
    </>
  )
}