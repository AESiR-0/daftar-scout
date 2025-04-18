"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface TeamMember {
  name: string
  isApproved: boolean
  status: string
}

interface Approval {
  status: 'approved' | 'rejected' | 'not_requested'
  isApproved: boolean
  date?: string
}

const dummyMembers: TeamMember[] = [
  { name: "John Doe", isApproved: true, status: "approved" },
  { name: "Jane Smith", isApproved: false, status: "rejected" },
  { name: "Mike Johnson", isApproved: false, status: "not_requested" }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

interface EndScoutingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}


export function EndScoutingDialog({ open, onOpenChange, onConfirm }: EndScoutingDialogProps) {
  const [approvals, setApprovals] = useState<TeamMember[]>(dummyMembers)
  const [isRequested, setIsRequested] = useState(false)
  const [confirmEndScouting, setConfirmEndScouting] = useState(false)

  const totalMembers = approvals.length
  const approvedCount = approvals.filter(m => m.isApproved).length

  const handleRequest = () => {
    setIsRequested(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[30rem]">
        <DialogHeader hidden={true}>
          <DialogTitle hidden>End Scouting?</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>Are you sure you want to end the scouting process?<br/><br/>All applications on hold will be marked as rejected, inbox applications will be declined, and all sent invites will be cancelled. However, scheduled meetings can still take place.</p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="confirm-end-scouting"
              className="border-gray-500"
              checked={confirmEndScouting}
              onCheckedChange={(checked) => setConfirmEndScouting(checked === true)}
            />
            <label htmlFor="confirm-end-scouting">I Agree</label>
          </div>

          <div className="flex justify-start">
            <Button
              onClick={handleRequest}
              className="bg-destructive rounded-[0.35rem] hover:bg-destructive/90"
              disabled={!confirmEndScouting}
            >
              End Scouting
            </Button>
          </div>

          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Team's Approval Required</h3>
              <p className="text-sm text-muted-foreground">{approvedCount} of {totalMembers} approved</p>
            </div>

            <div className="space-y-3">
              {approvals.map((member) => {
                const approval = approvals.find(a => a.isApproved === member.isApproved) || {
                  status: 'not_requested',
                  isApproved: false,
                  date: undefined
                }

                return (
                  <div
                    key={member.name}
                    className="flex items-center justify-between p-4 border rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {member.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(approval.status)}
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Scouting will end once all team members have approved
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 