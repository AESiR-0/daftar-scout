"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Sample data
const approvalRequests = [
  {
    id: "1",
    daftarName: "Tech Innovation Fund",
    approvedBy: "John Smith",
    designation: "Investment Manager",
    date: "2024-03-20T14:30:00",
    status: "pending",
    isCollaborator: false
  },
  {
    id: "2",
    daftarName: "Healthcare Ventures",
    approvedBy: "Sarah Johnson",
    designation: "Program Director",
    date: "2024-03-19T10:15:00",
    status: "pending",
    isCollaborator: true
  }
]

function ApprovalContent() {
  const router = useRouter()
  const pathname = usePathname()
  const [approvals, setApprovals] = useState(approvalRequests)
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null)

  const allApproved = approvals.every(request => request.status === "approved")
  const collaboratorPending = approvals.some(request => 
    request.isCollaborator && request.status === "pending"
  )

  const handleApproval = (id: string) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === id 
        ? { ...approval, status: "approved", date: new Date().toISOString() }
        : approval
    ))
  }

  const handleScheduleLaunch = () => {
    router.push("/investor/studio/schedule")
  }

  return (
    <div className="space-y-6 container mx-auto px-4">
      {/* Agreement Section */}
      <div className="flex items-start gap-2 p-4 border rounded-[0.3rem] bg-muted/50">
        <p className="text-sm text-muted-foreground">
          I agree that I have read all the data, and we're good to take the funds to the market.
        </p>
      </div>

      {/* Approval Cards */}
      <div className="space-y-3">
        {approvals.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 border rounded-[0.3rem]"
          >
            <div className="space-y-1">
              <h3 className="font-medium">{request.daftarName}</h3>
              <div className="space-y-0.5">
                <p className="text-sm">
                  {request.status === "approved" ? "Approved" : "Pending approval"} by{" "}
                  <span className="text-blue-600">{request.approvedBy}</span>
                  {request.isCollaborator && " (Collaborator)"}
                </p>
                <p className="text-sm text-muted-foreground">{request.designation}</p>
                <p className="text-xs text-muted-foreground">
                  {request.status === "approved" 
                    ? new Date(request.date).toLocaleString()
                    : "Awaiting approval"}
                </p>
              </div>
            </div>

            {request.status === "approved" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertDialog open={showConfirmation === request.id} onOpenChange={() => setShowConfirmation(null)}>
                <AlertDialogTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={request.status === "approved"}
                      onClick={() => setShowConfirmation(request.id)}
                      className="border-green-500 data-[state=checked]:bg-green-500"
                    />
                    <span className="text-sm text-muted-foreground">Approve</span>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve this? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleApproval(request.id)
                        setShowConfirmation(null)
                      }}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </div>

      {/* Schedule Launch Button */}
      {allApproved && !collaboratorPending && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleScheduleLaunch}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Schedule Launch
          </Button>
        </div>
      )}

      {collaboratorPending && (
        <p className="text-sm text-yellow-500 text-center">
          Waiting for collaborator approval before proceeding
        </p>
      )}
    </div>
  )
}

export default ApprovalContent