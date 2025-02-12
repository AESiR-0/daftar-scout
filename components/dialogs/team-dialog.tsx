"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, UserMinus, Trash2, Loader2, Languages, Phone, User, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import formatDate from "@/lib/formatDate"
import { Label } from "../ui/label"
import { FounderProfile } from "@/components/FounderProfile"


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
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  phone: string;
  gender: string;
  location: string;
  language: string[];
  designation: string;
  imageUrl?: string;
}

export function TeamDialog({ open, daftarData, onOpenChange, daftarId }: TeamDialogProps) {
  const [formData, setFormData] = useState<TeamMemberDetails>({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    phone: "",
    gender: "",
    location: "",
    language: [],
    designation: "",
    imageUrl: ""
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
        age: "",
        email: "",
        phone: "",
        gender: "",
        location: "",
        designation: "",
        language: [],
        imageUrl: ""
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
    formData.email &&
    formData.phone

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
  const getInitials = (name: string) => {
    const words = name.split(' ')
    return words.length > 1 ? words[0][0] + words[1][0] : name[0]
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

        <DialogContent className="max-w-3xl h-[80vh] p-0">
          <Tabs defaultValue="team" className="w-full  h-full flex flex-col">
            <div className="px-6 pt-6 ">
              <TabsList className="rounded-[0.35rem]">
                <TabsTrigger value="team" className="flex items-center gap-1">
                  Members
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem] ">
                    {teamMembers.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="invite" className="flex items-center gap-1">
                  Invite
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-1">
                  Pending
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-[0.35rem] ">
                    {pendingInvites.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="leave" className="">
                  Exit
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 px-6 pb-6">
              <TabsContent value="team" className="mt-4  data-[state=active]:block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {teamMembers.map((founder) => (
                    <div key={founder.email} className="p-4 border rounded-[0.35rem]">

                      <Avatar className="h-20 w-20 mb-5 text-3xl">
                        {founder.imageUrl ? (
                          <AvatarImage src={founder.imageUrl} alt={founder.name} />
                        ) : (
                          <AvatarFallback>{getInitials(founder.name)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col ">
                        <h4 className="text-sm font-medium">{founder.name}</h4>
                        <h4 className="text-sm font-medium">{founder.designation}</h4>
                        <h4 className="text-xs  flex gap-1 text-muted-foreground">
                          <span>{founder.gender}</span>
                          <span> {founder.age}</span>
                        </h4>
                      </div>
                      <div className="flex text-xs flex-col">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <p className="underline">{founder.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <p>{founder.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <p>{founder.location}</p>
                        </div>

                      </div>
                      <br />
                      <div className="flex text-xs flex-col gap-1">
                        <span>

                          Preferred languages to speak with investors
                        </span>
                        <span className="flex gap-2 flex-wrap">
                          {founder.language.map((language) => (
                            <span key={language} className="bg-muted p-1 rounded-md">{language}</span>
                          ))}</span>
                      </div>
                      <br />
                      <div className="text-xs">
                        <strong>On Daftar Since</strong> <br /> {formatDate(new Date().toISOString())}
                      </div>






                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="invite" className="mt-0">
                <div className="p-4 rounded-[0.35rem] border space-y-4">
                  <h3 className="font-medium">Invite Team Member</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Designation</Label>
                      <Input
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="Enter designation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={handleSendInvite}
                      disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.designation}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isInviting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Invite...
                        </>
                      ) : (
                        'Send Invitation'
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-0 overflow-auto">
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.email}
                      className="p-4 rounded-[0.35rem]  border flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">New Member</p>
                        <p className="text-xs text-muted-foreground">{invite.designation}</p>
                        <p className="text-xs text-muted-foreground">
                          Sent on {formatDate(invite.sentAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">


                        <Button
                          variant="ghost"
                          size="sm"
                          className="text- hover:text-red-700 hover:bg-red-50"
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
                    <h3 className="text-lg font-semibold ">Leave Team</h3>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to leave this team? This action cannot be undone.
                    </p>
                  </div>
                  <div className="space-y-2 rounded-md  p-4">
                    <p className="text-sm font-medium ">What happens when you leave:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>You will lose access to all team resources</li>
                      <li>Your contributions will remain with the team</li>
                      <li>You can be invited back by other team members</li>
                    </ul>
                  </div>
                  <Button
                    className="w-[15%]"
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
              className="bg- hover:bg-red-700"
            >
              Yes, leave team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}