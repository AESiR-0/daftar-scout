"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { daftarsData } from "@/lib/dummy-data/daftars"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FounderProfile } from "@/components/FounderProfile"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/format-date"
import { Clock, MinusCircle, X } from "lucide-react"
import { Check } from "lucide-react"

interface TeamMember {
  name: string
  email: string
  role: string
  isApproved: boolean
  status: string
  isUser?: boolean
  // Add required fields for FounderProfile
  age: string
  phone: string
  gender: string
  location: string
  designation: string
  language: string[]
  imageUrl?: string
  date?: string
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
    designation: "Founder",
    language: ["English", "Hindi"],
    isApproved: false,
    status: "pending",
    isUser: true,
    date: new Date().toISOString()
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Team Member",
    age: "32",
    phone: "+91 9876543211",
    gender: "Female",
    location: "Mumbai, India",
    designation: "CTO",
    language: ["English", "Marathi"],
    isApproved: false,
    status: "pending",
    isUser: false,
    date: new Date().toISOString()
  },
  // Add more team members as needed
]
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <Check className="h-5 w-5 text-green-500" />
    case 'rejected':
      return <X className="h-5 w-5 text-destructive" />
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />
    default:
      return <MinusCircle className="h-5 w-5 text-muted-foreground" />
  }
}

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
    <div className="flex px-5 mt-14 gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardContent className="space-y-6">
          <div className="flex flex-col p-4 rounded-lg space-y-6">
            {/* Initial Warning */}
            <p className="text-sm text-muted-foreground">
              All data related to the pitch will be deleted, and the offer will be withdrawn.
              An email will be sent to all stakeholders to notify them of this change.
            </p>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="user-consent"
                checked={userConsent}
                onCheckedChange={(checked: boolean) => setUserConsent(checked as boolean)}
                className="h-5 w-5 mt-0.5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              />
              <label
                htmlFor="user-consent"
                className="text-sm text-muted-foreground"
              >
                I agree to delete the pitch
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

            {deleteClicked && (
              <>
                {/* Team Approvals Section */}
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Team&apos;s Approval Required</h3>
                    <div className="text-sm text-muted-foreground">
                      {approvals.filter(a => a.isApproved).length} of {approvals.length}
                    </div>
                  </div>

                  <div>
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
                    <div className="pt-4">
                      <span className="text-xs text-muted-foreground"><strong> Deleted Daftar On </strong> <br /> {formatDate(new Date().toISOString())}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 