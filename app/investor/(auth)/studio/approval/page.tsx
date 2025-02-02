"use client"
import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"

// Sample data
const approvalRequests = [
  {
    id: "1",
    daftarName: "Tech Innovation Fund",
    approvedBy: "John Smith",
    designation: "Investment Manager",
    date: "2024-03-20T14:30:00",
    status: "approved"
  },
  {
    id: "2",
    daftarName: "Healthcare Ventures",
    approvedBy: "Sarah Johnson",
    designation: "Program Director",
    date: "2024-03-19T10:15:00",
    status: "pending"
  }
]

function ApprovalContent() {
  const pathname = usePathname()
  const mode = pathname.split('/')[3]
  const programId = pathname.split('/')[4]
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
        {approvalRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 border rounded-[0.3rem]"
          >
            <div className="space-y-1">
              <h3 className="font-medium">{request.daftarName}</h3>
              <div className="space-y-0.5">
                <p className="text-sm">
                  Approved by <span className="text-blue-600">{request.approvedBy}</span>
                </p>
                <p className="text-sm text-muted-foreground">{request.designation}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(request.date).toLocaleString()}
                </p>
              </div>
            </div>

            {request.status === "approved" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApprovalContent