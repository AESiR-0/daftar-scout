"use client"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Languages } from "lucide-react"

interface ProfileHoverCardProps {
  name: string
  daftar: string
  children: React.ReactNode
  designation?: string
  email?: string
  phone?: string
  languages?: string[]
}

export function ProfileHoverCard({ 
  name, 
  daftar, 
  children,
  designation = "Investment Associate",
  email = "user@example.com",
  phone = "+1 (555) 123-4567",
  languages = ["English", "Spanish"]
}: ProfileHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{name}</h4>
            <p className="text-sm text-muted-foreground">
              {designation} at {daftar}
            </p>
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Languages className="h-3.5 w-3.5" />
                <span>{languages.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
} 