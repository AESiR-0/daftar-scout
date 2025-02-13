"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FounderProfile } from "@/components/FounderProfile"
import { Mail, Phone, MapPin, PlusCircle, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamMember {
  firstName: string
  lastName: string
  email: string
  phone: string
  age: string
  gender: string
  location: string
  language: string[]
  designation: string
  imageUrl?: string
}

export default function TeamPage() {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    const [firstName, lastName] = name.split(' ')
    return firstName?.[0] + (lastName?.[0] || '')
  }

  const [members, setMembers] = useState<TeamMember[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [newMember, setNewMember] = useState<TeamMember>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "25",
    gender: "Not Specified",
    location: "Not Specified",
    language: ["English"],
    designation: "Team Member",
    imageUrl: undefined
  })

  const handleInvite = () => {
    if (newMember.firstName && newMember.lastName && newMember.email && newMember.phone) {
      setMembers([...members, newMember])
      setNewMember({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        age: "25",
        gender: "Not Specified",
        location: "Not Specified",
        language: ["English"],
        designation: "Team Member",
        imageUrl: undefined
      })
      setShowInviteForm(false)
    }
  }

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex items-center mt-4 justify-between">
        <h1 className="text-2xl font-semibold">Team Members</h1>
        <Button variant="outline" onClick={() => setShowInviteForm(true)} disabled={showInviteForm}>
          Invite Member
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Invite Team Member</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowInviteForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              value={newMember.firstName}
              onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
            />
            <Input
              placeholder="Last Name"
              value={newMember.lastName}
              onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              type="tel"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
            />
            <Button 
              onClick={handleInvite}
              className="col-span-2"
              disabled={!newMember.firstName || !newMember.lastName || !newMember.email || !newMember.phone}
            >
              Invite Member
            </Button>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => (
          <Card className="p-4" key={index}>
            <Avatar className="h-20 w-20 mb-5 text-3xl">
                    {member.imageUrl ? (
                        <AvatarImage src={member.imageUrl} alt={member.firstName} />
                    ) : (
                        <AvatarFallback>{getInitials(member.firstName)}</AvatarFallback>
                    )}
                </Avatar>
                <div className="flex flex-col">
                     <h4 className="text-sm font-medium">{member.firstName} {member.lastName}</h4>
                    <h4 className="text-sm font-medium">{member.designation}</h4>
                    <h4 className="text-xs  flex gap-1 text-muted-foreground">
                        <span>{member.gender}</span>
                        <span> {member.age}</span>
                    </h4>
                </div>
                <div className="flex text-xs flex-col">
                    <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <p className="underline">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <p>{member.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <p>{member.location}</p>
                    </div>

                </div>
                <br />
                <div className="flex text-xs flex-col gap-1">
                    <span>

                        Preferred languages to speak with investors
                    </span>
                    <span className="flex gap-2 flex-wrap">
                        {member.language.map((language) => (
                            <span key={language} className="bg-muted p-1 rounded-md">{language}</span>
                        ))}</span>
                </div>
                <br />
                <div className="text-xs">
                    <strong>On Daftar Since</strong> <br /> {formatDate(new Date().toISOString())}
                </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 