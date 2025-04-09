"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, Clock, MinusCircle, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import formatDate from "@/lib/formatDate"
import { Button } from "@/components/ui/button"
import { toast, useToast } from "@/hooks/use-toast"
import { StudioNav } from "@/components/navbar/studio-nav"


interface ApprovalRequest {
  id: string
  username: string
  designation: string
  date: string
  daftar: string
  status: "approved" | "pending"
  profile: {
    name: string
    designation: string
  }
}

const initialApprovalRequests: ApprovalRequest[] = [
  {
    id: "1",
    username: "John Smith",
    designation: "Investment Director",
    date: formatDate(new Date().toISOString()),
    status: "approved",
    daftar: "tech innovators",
    profile: {
      name: "John Smith",
      designation: "Investment Director"
    }
  },
  {
    id: "2",
    username: "Sarah Johnson",
    designation: "Portfolio Manager",
    date: formatDate(new Date().toISOString()),
    status: "pending",
    daftar: "tech innovators",
    profile: {
      name: "Sarah Johnson",
      designation: "Portfolio Manager"
    }
  },
  {
    id: "3",
    username: "Michael Chen",
    designation: "Investment Analyst",
    date: formatDate(new Date().toISOString()),
    status: "pending",
    daftar: "tech startup",
    profile: {
      name: "Michael Chen",
      designation: "Investment Analyst"
    }
  }
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

// Add this interface for error tracking
interface ErrorSummary {
  details: {
    title: string;
    errors: string[];
  }[];
}

// Add sample error data
const sampleErrors: ErrorSummary = {
  details: [
    {
      title: "Scout Details",
      errors: [
        "Scout name is required",
        "Scout description is missing",
        "Location not specified"
      ]
    },
    {
      title: "Audience",
      errors: [
        "Target audience not defined",
        "Investment criteria not specified"
      ]
    },
    {
      title: "Documents",
      errors: [
        "Required documents not uploaded",
        "Terms and conditions document missing"
      ]
    },
    {
      title: "Investor's Pitch",
      errors: [
        "Pitch video not uploaded"
      ]
    }
  ]
}

export default function ApprovalPage() {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(initialApprovalRequests)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<ErrorSummary>(sampleErrors)

  // Add approval counts calculation
  const totalMembers = approvalRequests.length
  const approvedCount = approvalRequests.filter(req => req.status === "approved").length

  return (
    <div className="flex ">
      <div className="container mx-auto
     px-5 mt-2">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Approval Section */}
          <div className="col-span-2">
            <Card className="border-none bg-[#0e0e0e]">
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center mt-4 space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      className="h-5 w-5 mt-0.5 border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      All the data looks good to me. We can take the Scout live.
                    </label>
                  </div>

                  <Button
                    variant="outline"
                    className="w-fit rounded-[0.3rem]"
                    disabled={!termsAccepted}
                    onClick={() => {
                      toast({
                        title: "Scout Approved",
                        description: "Your approval has been submitted successfully"
                      })
                    }}
                  >
                    Approve Scout
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Team&apos;s Approval Required</h3>
                    <div className="text-sm text-muted-foreground">
                      {approvedCount} of {totalMembers}
                    </div>
                  </div>

                  <div className="">
                    {approvalRequests.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-background"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{member.username[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {member.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.designation}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.daftar}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(member.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Error Summary */}
          <div className="mt-2">
            <Card className="border-none bg-[#0e0e0e]">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Review Required</h3>
                  <div className="space-y-6">
                    {errors.details.map((section, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="text-sm text-muted-foreground">{section.title}</h4>
                        <ul className="space-y-1">
                          {section.errors.map((error, errorIndex) => (
                            <li key={errorIndex} className="text-xs text-white flex items-start gap-2">
                              <span className="mt-0.5">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Please review and fix these issues before proceeding with the approval.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>

  )
}