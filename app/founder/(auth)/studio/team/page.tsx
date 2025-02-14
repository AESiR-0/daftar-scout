"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, MapPin, X, Phone, Pencil, Check, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  designation: string
  age: string
  gender: string
  location: string
  language: string[]
  imageUrl?: string
  status: 'active' | 'pending'
  isCurrentUser?: boolean
  joinDate: string
  phone: string
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

  const formatPhoneNumber = (phone: string) => {
    // Match country code (anything from start until last 10 digits)
    const match = phone.match(/^(.+?)(\d{10})$/)
    if (match) {
      return `${match[1]} ${match[2]}`
    }
    return phone
  }

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      firstName: 'Current',
      lastName: 'User',
      email: 'current@user.com',
      designation: 'Founder',
      age: '28',
      gender: 'Male',
      location: 'Dubai, UAE',
      language: ['English', 'Arabic'],
      status: 'active',
      isCurrentUser: true,
      joinDate: '2024-01-15',
      phone: '+971526374859'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Ahmed',
      email: 'sarah.ahmed@example.com',
      designation: 'CTO',
      age: '32',
      gender: 'Female',
      location: 'Abu Dhabi, UAE',
      language: ['English', 'Arabic', 'French'],
      status: 'active',
      joinDate: '2024-02-01',
      phone: '+971526374859'
    },
    {
      id: '3',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      designation: 'Product Manager',
      age: '30',
      gender: 'Male',
      location: 'Dubai, UAE',
      language: ['English', 'Spanish'],
      status: 'pending',
      joinDate: '2024-03-10',
      phone: '+971526374859'
    }
  ])
  const [newMember, setNewMember] = useState<TeamMember>({
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
    age: "25",
    gender: "Not Specified",
    location: "Not Specified",
    language: ["English"],
    status: 'pending',
    id: '2',
    joinDate: '2024-03-10',
    phone: '+971526374859'
  })

  const activeMembers = members.filter(m => m.status === 'active')
  const pendingMembers = members.filter(m => m.status === 'pending')

  const handleInvite = () => {
    if (newMember.firstName && newMember.lastName && newMember.email && newMember.designation) {
      setMembers([...members, newMember])
      setNewMember({
        firstName: "",
        lastName: "",
        email: "",
        designation: "",
        age: "25",
        gender: "Not Specified",
        location: "Not Specified",
        language: ["English"],
        status: 'pending',
        id: '2',
        joinDate: '2024-03-10',
        phone: '+971526374859'
      })
    }
  }

  const handleCancelInvite = (id: string) => {
    setMembers(members.filter(member => member.id !== id))
  }

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id))
  }

  const handleWithdraw = () => {
    // Handle withdraw logic
    console.log('Withdrawing from team')
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editDesignation, setEditDesignation] = useState("")

  const handleSaveDesignation = () => {
    // Update member designation logic here
    setIsEditing(false)
  }

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Avatar className="h-60 w-60 rounded-lg">
            {member.imageUrl ? (
              <AvatarImage src={member.imageUrl} alt={member.firstName} className="rounded-lg" />
            ) : (
              <AvatarFallback className="rounded-lg text-xl">{getInitials(member.firstName)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-medium">{member.firstName} {member.lastName}</h4>
            </div>

            <div className="space-y-2 mt-4">
              <div className="space-y-1 text-sm text-muted-foreground">
                {isEditing && member.isCurrentUser ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="h-8"
                      placeholder="Enter your designation"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveDesignation}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{member.designation}</p>
                )}
                <div className="flex items-center gap-2">
                  <span>{member.age}</span>
                  <span>•</span>
                  <span>{member.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p>{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>{formatPhoneNumber(member.phone)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>{member.location}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Preferred languages to connect with investors: {member.language.join(', ')}
                </p>
              </div>

              <p className="text-xs pt-2 text-muted-foreground">
                On Daftar Since <br /> {formatDate(member.joinDate)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {member.isCurrentUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {member.isCurrentUser ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWithdraw}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMember(member.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  const PendingCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            {member.imageUrl ? (
              <AvatarImage src={member.imageUrl} alt={member.firstName} />
            ) : (
              <AvatarFallback>{getInitials(member.firstName)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{member.firstName} {member.lastName}</h4>
              {member.isCurrentUser && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">You</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{member.designation}</p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCancelInvite(member.id)}
          className="text-red-500 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 px-10">
      {/* Invite Form */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 mt-8">
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
              placeholder="Designation"
              value={newMember.designation}
              onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
            />
          <Input
            placeholder="Email"
            type="email"
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
          />
          <Button
            onClick={handleInvite}
            className="w-[25%] bg-muted hover:bg-muted/50"
            disabled={!newMember.firstName || !newMember.lastName || !newMember.email || !newMember.designation}
          >
            Invite Member
          </Button>
        </div>
      </div>

      {/* Tabs and Members List */}
      <Tabs defaultValue="Team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="Team" className="flex items-center gap-2">
            Team
            <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
              {activeMembers.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="Pending" className="flex items-center gap-2">
            Pending
            <span className="bg-muted px-2 py-0.5 rounded-[0.35rem] text-xs">
              {pendingMembers.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="Team">
          <div className="space-y-4">
            {activeMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Pending">
          <div className="space-y-4">
            {pendingMembers.map((member) => (
              <PendingCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 