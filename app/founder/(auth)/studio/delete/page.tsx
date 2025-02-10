"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { daftarsData } from "@/lib/dummy-data/daftars"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FounderProfile } from "@/components/FounderProfile"

interface TeamMember {
  name: string
  email: string
  role: string
  isApproved: boolean
  isUser?: boolean
  // Add required fields for FounderProfile
  age: string
  phone: string
  gender: string
  location: string
  language: string[]
  imageUrl?: string
}

// Get the first daftar's team data
const selectedDaftar = daftarsData[0]
const teamMembers: TeamMember[] = [
  {
    name: "John Doe",
    email: "john@example.com",
    role: "You",
    age: "28",
    phone: "+91 9876543210",
    gender: "Male",
    location: "Bangalore, India",
    language: ["English", "Hindi"],
    isApproved: false,
    isUser: true
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Team Member",
    age: "32",
    phone: "+91 9876543211",
    gender: "Female",
    location: "Mumbai, India",
    language: ["English", "Marathi"],
    isApproved: false,
    isUser: false
  },
  // Add more team members as needed
]

export default function DeletePage() {
  const router = useRouter()
  const deletionDate = new Date().toISOString()
  const [approvals, setApprovals] = useState<TeamMember[]>(teamMembers)
  const [userConsent, setUserConsent] = useState(false)
  const [deleteClicked, setDeleteClicked] = useState(false)

  const handleDelete = () => {
    if (userConsent) {
      // Update current user's approval
      setApprovals(prev => prev.map(member => 
        member.isUser ? { ...member, isApproved: true } : member
      ))
      setDeleteClicked(true)
    }
  }

  const pendingApprovals = approvals.filter(member => !member.isApproved).length

  return (
    <div className="flex gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardHeader>
          <CardTitle> </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Delete Pitch</h2>
            <div className="flex flex-col p-4 border rounded-lg">
              {/* Warning Message */}
              <p className="text-sm text-muted-foreground mb-4">
                All data related to the program will be deleted, and the offer will be withdrawn.
                An email will be sent to all stakeholders to notify them of this change
              </p>

              {/* Approval List */}
              <div className="space-y-4 mb-4">
                {approvals.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FounderProfile founder={member} />
                      </div>
                    </div>
                    <Checkbox
                      id={`approval-${member.email}`}
                      checked={member.isApproved}
                      disabled
                      className="h-5 w-5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                  </div>
                ))}
              </div>

              {deleteClicked && pendingApprovals > 0 && (
                <p className="text-sm text-yellow-600 font-medium mb-4">
                  Waiting for approval from {pendingApprovals} team member{pendingApprovals !== 1 ? 's' : ''}
                </p>
              )}

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2 mb-4">
                <Checkbox
                  id="user-consent"
                  checked={userConsent}
                  onCheckedChange={(checked) => setUserConsent(checked as boolean)}
                  className="h-5 w-5 mt-0.5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor="user-consent"
                  className="text-sm text-muted-foreground"
                >
                  I agree that I have read all the data, and we are deleting the program.
                </label>
              </div>

              {/* Delete Button */}
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!userConsent || deleteClicked}
                className="w-[12%] bg-muted hover:bg-muted/50"
              >
                Delete
              </Button>

              {/* Deletion Info */}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  All data related to the pitch has been deleted, and the offer has been withdrawn.
                  The pitch is no longer available.
                </p>
                {deleteClicked && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Request initiated on: {new Date(deletionDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 