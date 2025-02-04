"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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

// Sample data for both roles
const deleteRequests = [
  {
    id: "1",
    name: "AI Healthcare Assistant",
    approvedBy: "Sarah Johnson",
    designation: "Scout Director",
    date: "2024-03-19T10:15:00",
    status: "pending",
    isCollaborator: false
  },
  {
    id: "2",
    name: "AI Healthcare Assistant",
    approvedBy: "Mike Wilson",
    designation: "Scout Director",
    date: "2024-03-19T10:15:00",
    status: "pending",
    isCollaborator: true
  }
]

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function DeletePage() {
  const router = useRouter()
  const [approvals, setApprovals] = useState(deleteRequests)
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null)
  const deletionDate = formatDate(new Date().toISOString())

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

  const handleDelete = () => {
    router.push("/founder/daftar")
  }

  return (
    <div className="space-y-6 mx-auto max-w-6xl mt-5">
      <h1 className="text-2xl font-semibold text-destructive">
        Delete Scout
      </h1>

      <div className="space-y-6">
        <p className="text-muted-foreground">
          Are you sure you want to delete this Scout? This action cannot be undone.
        </p>

        <div className="flex items-start gap-2 p-4 border rounded-[0.3rem] bg-muted/50">
          <p className="text-sm text-muted-foreground">
            I agree that I have read all the data, and we're good to delete the Scout.
          </p>
        </div>

        <div className="space-y-3">
          {approvals.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 border rounded-[0.3rem]"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{request.name}</h3>
                <div className="space-y-0.5">
                  <p className="text-sm">
                    {request.status === "approved" ? "Approved" : "Pending approval"} by{" "}
                    <span className="text-blue-600">{request.approvedBy}</span>
                    {request.isCollaborator && " (Collaborator)"}
                  </p>
                  <p className="text-sm text-muted-foreground">{request.designation}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.status === "approved" 
                      ? formatDate(request.date)
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
                      <AlertDialogTitle>Confirm Deletion Approval</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve this deletion? This action cannot be undone.
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

        {collaboratorPending && (
          <p className="text-sm text-yellow-500 text-center">
            Waiting for collaborator approval before proceeding with deletion
          </p>
        )}

        {allApproved && !collaboratorPending && (
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete Scout
            </Button>
          </div>
        )}

        {allApproved && (
          <div className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              All data related to the Scout has been deleted.
              The Scout is no longer available.
            </p>
            <p className="text-xs text-muted-foreground">
              Deletion Date: {deletionDate}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 