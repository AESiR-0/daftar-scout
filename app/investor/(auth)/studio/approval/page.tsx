"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { InvestorProfile } from "@/components/InvestorProfile"
import { Users2, Calendar } from "lucide-react"
import formatDate from "@/lib/formatDate"
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
import { Checkbox } from "@/components/ui/checkbox"

interface InvestorProfile {
  name: string
  email: string
  role: string
  isApproved: boolean
  isUser?: boolean
  designation: string
  approvalDate: string
  isCollaborator: boolean
  age: string
  phone: string
  gender: string
  location: string
  languages: string[]
  imageUrl?: string
  daftarName: string
  structure: string
  website: string
  onDaftarSince: string
  bigPicture: string
}

const approvalRequests: InvestorProfile[] = [
  {
    name: "John Smith",
    email: "john@example.com",
    role: "Investment Manager",
    designation: "Investment Manager",
    approvalDate: "2024-03-20T14:30:00",
    isApproved: false,
    isCollaborator: false,
    isUser: true,
    age: "35",
    phone: "+1 234-567-8900",
    gender: "Male",
    location: "New York, USA",
    languages: ["English"],
    daftarName: "Tech Innovation Fund",
    structure: "VC Fund",
    website: "example.com",
    onDaftarSince: "2024-01",
    bigPicture: "Investing in breakthrough technologies",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "Program Director",
    designation: "Program Director",
    approvalDate: "2024-03-19T10:15:00",
    isApproved: false,
    isCollaborator: true,
    age: "42",
    phone: "+1 234-567-8901",
    gender: "Female",
    location: "San Francisco, USA",
    languages: ["English", "Spanish"],
    daftarName: "Healthcare Ventures",
    structure: "Angel Network",
    website: "healthcare.com",
    onDaftarSince: "2024-02",
    bigPicture: "Supporting healthcare innovations",
  }
]

export default function ApprovalContent() {
  const router = useRouter()
  const [approvals, setApprovals] = useState<InvestorProfile[]>(approvalRequests)
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null)
  const [userConsent, setUserConsent] = useState(false)

  const allApproved = approvals.every(request => request.isApproved)
  const collaboratorPending = approvals.some(request =>
    request.isCollaborator && !request.isApproved
  )

  const handleApproval = (email: string) => {
    setApprovals(prev => prev.map(approval =>
      approval.email === email
        ? { ...approval, isApproved: true, approvalDate: new Date().toISOString() }
        : approval
    ))
  }

  const handleUserConsent = () => {
    setUserConsent(true)
    const currentUser = approvals.find(member => member.isUser)
    if (currentUser) {
      handleApproval(currentUser.email)
    }
  }

  const handleScheduleLaunch = () => {
    router.push("/investor/studio/schedule")
  }

  return (
    <div className="flex gap-6">
      <Card className="border-none bg-[#0e0e0e] flex-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4" />
                <span className="text-sm">{approvals.length} Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="mb-8">
            <div className="flex flex-col p-6 border rounded-lg bg-card/50">
              {/* Consent Section */}
              <div className="mb-8 relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b rounded-full" />
                <div className="pl-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    I agree that I have read all the data, and we're good to take the funds to the market.
                  </p>
                  <Button
                    onClick={handleUserConsent}
                    disabled={userConsent}
                    className="w-full "
                  >
                    {userConsent ? "Approved" : "Approve"}
                  </Button>
                </div>
              </div>

              {/* Approval List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Team Approvals</h3>
                {approvals.map((member) => (
                  <div
                    key={member.email}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors bg-muted/50`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <InvestorProfile investor={member} />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            {member.isCollaborator && (
                              <span className="text-xs px-2 py-0.5 rounded-full">
                                Collaborator
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {member.isApproved
                              ? `Approved ${formatDate(member.approvalDate)}`
                              : "Awaiting approval"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {!member.isUser && !member.isApproved ? (
                        <AlertDialog open={showConfirmation === member.email} onOpenChange={() => setShowConfirmation(null)}>
                          <AlertDialogTrigger asChild>
                            <Checkbox
                              onClick={() => setShowConfirmation(member.email)}
                              className="h-5 w-5 border-2 border-gray-400  cursor-pointer"
                            />
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
                                  handleApproval(member.email)
                                  setShowConfirmation(null)
                                }}
                              >
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Checkbox
                          checked={member.isApproved}
                          disabled
                          className="h-5 w-5 border-2 border-gray-400 "
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              {allApproved && !collaboratorPending && (
                <div className="mt-8 pt-6 border-t">
                  <Button
                    onClick={handleScheduleLaunch}
                    className="w-full bg-gradient-to-r"
                    disabled={!userConsent}
                  >
                    Schedule Launch
                  </Button>
                </div>
              )}

              {collaboratorPending && (
                <div className="mt-6 p-4  rounded-lg">
                  <p className="text-sm  text-center font-medium">
                    Waiting for collaborator approval before proceeding
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}