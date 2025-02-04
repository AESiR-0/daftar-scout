"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface ApprovalRequest {
  id: string
  name: string
  approvedBy: string
  designation: string
  date: string
  status: "approved" | "pending"
  isApproved?: boolean
}

// Sample data modified to include isApproved state
const approvalRequests: ApprovalRequest[] = [
  {
    id: "1",
    name: "AI Healthcare Assistant",
    approvedBy: "Sarah Johnson",
    designation: "Program Director",
    date: "2024-03-19T10:15:00",
    status: "pending",
    isApproved: false
  },
  {
    id: "2",
    name: "AI Healthcare Assistant",
    approvedBy: "Sarah Johnson",
    designation: "Program Director",
    date: "2024-03-19T10:15:00",
    status: "pending",
    isApproved: false
  }
]

// Add the formatDate function
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function DeletePage() {
  const router = useRouter()
  const deletionDate = formatDate(new Date().toISOString())
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(approvalRequests)
  const [userConsent, setUserConsent] = useState(false)
  
  const allApproved = approvals.every(request => request.isApproved) && userConsent
  
  const handleApprovalChange = (id: string, checked: boolean) => {
    setApprovals(prev => prev.map(request => 
      request.id === id ? { ...request, isApproved: checked } : request
    ))
  }

  const handleDelete = () => {
    if (allApproved) {
      router.push("/founder/daftar")
    }
  }

  return (
    <div className="space-y-6  mx-auto max-w-6xl mt-5">

      <h1 className="text-2xl font-semibold text-destructive">
        Delete Pitch
      </h1>

      <div className="space-y-6">
        <p className="text-muted-foreground">
          Are you sure you want to delete this pitch? This action cannot be undone.
        </p>

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
                    Approval needed from <span className="text-blue-600">{request.approvedBy}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{request.designation}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(request.date)}
                  </p>
                </div>
              </div>
              <Checkbox 
                id={`approval-${request.id}`}
                checked={request.isApproved}
                onCheckedChange={(checked) => handleApprovalChange(request.id, checked as boolean)}
              />
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-4 border rounded-[0.3rem] bg-muted/50">
          <Checkbox 
            id="user-consent" 
            checked={userConsent}
            onCheckedChange={(checked) => setUserConsent(checked as boolean)}
          />
          <label 
            htmlFor="user-consent" 
            className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree that I have read all the data, and we're good to delete the pitch.
          </label>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!allApproved}
          >
            Delete Pitch
          </Button>
        </div>

        <div className="space-y-2 pt-4">
          <p className="text-sm text-muted-foreground">
            All data related to the pitch has been deleted
            The pitch is no longer available.
          </p>
          <p className="text-xs text-muted-foreground">
            Deletion Date: {deletionDate}
          </p>
        </div>
      </div>

    </div>
  )
} 