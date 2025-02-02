"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Sample data for both roles
const approvalRequests = [
  {
    id: "1",
    name: "AI Healthcare Assistant",
    approvedBy: "Sarah Johnson",
    designation: "Scout Director",
    date: "2024-03-19T10:15:00",
    status: "approved"
  },
  {
    id: "2",
    name: "AI Healthcare Assistant",
    approvedBy: "Sarah Johnson",
    designation: "Scout Director",
    date: "2024-03-19T10:15:00",
    status: "approved"
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
  const handleDelete = () => {
    router.push("/founder/daftar")
  }

  return (
    <div className="space-y-6  mx-auto max-w-6xl mt-5">

      <h1 className="text-2xl font-semibold text-destructive">
        Delete Scout
      </h1>

      <div className="space-y-6">
        <p className="text-muted-foreground">
          Are you sure you want to delete this Scout? This action cannot be undone.
        </p>

        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Delete Scout
          </Button>
        </div>

        <div className="flex items-start gap-2 p-4 border rounded-[0.3rem] bg-muted/50">
          <p className="text-sm text-muted-foreground">
            I agree that I have read all the data, and we're good to delete the Scout.
          </p>
        </div>

        <div className="space-y-3">
          {approvalRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 border rounded-[0.3rem]"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{request.name}</h3>
                <div className="space-y-0.5">
                  <p className="text-sm">
                    Approved by <span className="text-blue-600">{request.approvedBy}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{request.designation}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(request.date)}
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

        <div className="space-y-2 pt-4">
          <p className="text-sm text-muted-foreground">
            All data related to the Scout has been deleted
            The Scout is no longer available.
          </p>
          <p className="text-xs text-muted-foreground">
            Deletion Date: {deletionDate}
          </p>
        </div>
      </div>

    </div>
  )
} 