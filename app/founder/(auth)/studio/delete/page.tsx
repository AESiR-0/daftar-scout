"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { daftarsData } from "@/lib/dummy-data/daftars"
import { Badge } from "@/components/ui/badge"

interface TeamMember {
  name: string
  email: string
  role: string
  isApproved: boolean
  isOwner?: boolean
}

// Get the first daftar's team data and combine owner and members
const selectedDaftar = daftarsData[0]
const teamMembers: TeamMember[] = [
  {
    name: selectedDaftar.team.owner,
    email: "owner@example.com", // You might want to add this to your data structure
    role: "Owner",
    isApproved: true,
    isOwner: true
  },
  ...selectedDaftar.team.members.map(member => ({
    ...member,
    isApproved: false,
    isOwner: false
  }))
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
  const [approvals] = useState<TeamMember[]>(teamMembers)
  const [userConsent, setUserConsent] = useState(false)
  
  const pendingApprovals = approvals.filter(member => !member.isApproved && !member.isOwner).length
  
  const handleDelete = () => {
    if (userConsent) {
      router.push("/founder/daftar")
    }
  }

  return (
    <div className="space-y-6 mx-auto max-w-6xl mt-5">
      <h1 className="text-2xl font-semibold text-destructive">
        Delete Pitch
      </h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Are you sure you want to delete this pitch? This action cannot be undone.
          </p>
          {pendingApprovals > 0 && (
            <p className="text-sm text-yellow-600 font-medium">
              Waiting for approval from {pendingApprovals} team member{pendingApprovals !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {approvals.map((member) => (
            <div
              key={member.email}
              className="flex items-center justify-between p-4 border rounded-[0.3rem]"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{member.name}</h3>
                  {member.isOwner && (
                    <Badge variant="secondary" className="text-xs">
                      Owner
                    </Badge>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <p className="text-sm text-blue-600">{member.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.isOwner 
                      ? 'Automatically approved (Owner)' 
                      : member.isApproved 
                        ? 'Approved' 
                        : 'Pending approval'
                    }
                  </p>
                </div>
              </div>
              <Checkbox 
                id={`approval-${member.email}`}
                checked={member.isApproved || member.isOwner}
                disabled
                className="h-5 w-5 border-2 border-gray-400 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
              />
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-4 border rounded-[0.3rem] bg-muted/50">
          <Checkbox 
            id="user-consent" 
            checked={userConsent}
            onCheckedChange={(checked) => setUserConsent(checked as boolean)}
            className="h-5 w-5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
          <label 
            htmlFor="user-consent" 
            className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I understand that this pitch will be deleted once all team members approve
          </label>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!userConsent || pendingApprovals > 0}
          >
            Delete Pitch
          </Button>
        </div>

        <div className="space-y-2 pt-4">
          <p className="text-sm text-muted-foreground">
            The pitch will be permanently deleted after receiving all required approvals.
          </p>
          <p className="text-xs text-muted-foreground">
            Request initiated on: {deletionDate}
          </p>
        </div>
      </div>
    </div>
  )
} 