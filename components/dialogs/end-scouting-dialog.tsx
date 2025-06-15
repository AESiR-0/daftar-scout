"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useParams, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
interface TeamMember {
  name: string
  isApproved: boolean
  daftarName: string
  designation: string
  status: string
}

interface Approval {
  status: 'approved' | 'rejected' | 'not_requested'
  isApproved: boolean
  date?: string
}

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
  const params = useParams()
  const { toast } = useToast()
  const [approvals, setApprovals] = useState<TeamMember[]>([])
  const [isRequested, setIsRequested] = useState(false)
  const [confirmEndScouting, setConfirmEndScouting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const pathname = usePathname()
  const scoutId = pathname.split('/').pop()
  const isJasScout = scoutId === 'jas730'
  const [currentUserApprovalStatus, setCurrentUserApprovalStatus] = useState(false)
  const totalMembers = approvals.length
  const approvedCount = approvals.filter(m => m.isApproved).length

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`/api/endpoints/scouts/delete?scoutId=${scoutId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch team members')
        }
        const data = await response.json()
        setApprovals(data.members || [])
        setCurrentUserApprovalStatus(data.currentUserApprovalStatus || false)
      } catch (error) {
        console.error('Error fetching team members:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch team members',
          variant: 'destructive',
        })
      }
    }

    if (open) {
      fetchTeamMembers()
    }
  }, [open, scoutId, toast])

  const handleRequest = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/endpoints/scouts/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoutId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to request team approval')
      }

      setIsRequested(true)
      toast({
        title: 'Success',
        description: 'Request sent to team members',
      })
    } catch (error) {
      console.error('Error requesting team approval:', error)
      toast({
        title: 'Error',
        description: 'Failed to request team approval',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch('/api/endpoints/scouts/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoutId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete scout')
      }

      onConfirm()
      onOpenChange(false)
      toast({
        title: 'Success',
        description: 'Scout deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting scout:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete scout',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[30rem]">
        <DialogHeader hidden={true}>
          <DialogTitle hidden>End Scouting?</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>Are you sure you want to end the scouting process?<br /><br />All applications on hold will be marked as rejected, inbox applications will be declined, and all sent invites will be cancelled. However, scheduled meetings can still take place.</p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="confirm-end-scouting"
              className="border-gray-500"
              checked={confirmEndScouting || currentUserApprovalStatus}
              onCheckedChange={(checked) => setConfirmEndScouting(checked === true)}
              disabled={isJasScout || currentUserApprovalStatus}
            />
            <label htmlFor="confirm-end-scouting">I Agree</label>
          </div>

          <div className="flex justify-start">
            <Button
              onClick={isRequested ? handleDelete : handleRequest}
              className="bg-destructive rounded-[0.35rem] hover:bg-destructive/90"
              disabled={!confirmEndScouting || isJasScout || isLoading || isDeleting || currentUserApprovalStatus}
            >
              {isLoading ? 'Requesting...' : isDeleting ? 'Deleting...' : isRequested ? 'Delete Scout' : 'End Scouting'}
            </Button>
          </div>

          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Team's Approval Required</h3>
              <p className="text-sm text-muted-foreground">{approvedCount} of {totalMembers} approved</p>
            </div>

            <div className="space-y-3 p-4 px-0">
              <ScrollArea className="h-[175px] rounded-md ">
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
                          <p className="text-xs text-muted-foreground">
                            {member.designation}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.daftarName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(approval.status)}
                      </div>

                    </div>
                  )
                })}
              </ScrollArea>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Scouting will end once all team members have approved
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  )
} 