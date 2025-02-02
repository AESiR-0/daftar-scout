"use client"
import { useState } from "react"
import { Play, FileText, Bell, ChevronRight, Folder, ChevronDown } from "lucide-react"
import { usePathname } from "next/navigation"
import { daftarsData } from "@/lib/dummy-data/daftars"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { ProfileDialog } from "@/components/dialogs/profile-dialog"
// import { ThemeToggle } from "@/components/theme/theme-toggle"
import { JournalDialog } from "@/components/dialogs/journal-dialog"
import { NotificationDialog } from "@/components/dialogs/notification-dialog"
// import { useRole } from "@/contexts/role-context"
import { topNavConfig } from "@/config/navigation"
import { DaftarDialog } from "@/components/dialogs/daftar-dialog"
import { SearchAndFilter } from "./search-and-filter"
import { BookmarkFilter } from "@/components/navbar/bookmark-filter"

export function TopNav({ role }: { role: string }) {
  const navActions = role === "investor" ? topNavConfig["investor"] : topNavConfig["founder"]
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)
  const [profileOpen, setProfileOpen] = useState(false)
  const [journalOpen, setJournalOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [daftarOpen, setDaftarOpen] = useState(false)
  const [selectedDaftar, setSelectedDaftar] = useState(daftarsData[0]?.id || '')

  // Only show search on specific pages
  const showSearch = pathname.includes('/scout') ||
    pathname.includes('meetings') ||
    pathname.includes('incubation') ||
    pathname.includes('/daftar') ||
    pathname.includes('/pitch-board') ||
    pathname.includes('/studio/collaboration') ||
    pathname.includes('/studio/document')

  // Show daftar selector on pitch-board and daftar pages
  const showDaftarSelector = pathname.includes('/pitch-board') || pathname.includes('/daftar')

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'journal':
        setJournalOpen(true)
        break
      case 'notifications':
        setNotificationOpen(true)
        break
      case 'daftar':
        setDaftarOpen(true)
        break
      default:
        break
    }
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center overflow-hidden">
            <Breadcrumb className="flex items-center">
              {paths.map((path, index) => (
                <BreadcrumbItem key={path} className="flex items-center min-w-fit">
                  <BreadcrumbLink
                    href={`/${paths.slice(0, index + 1).join('/')}`}
                    className="text-md truncate"
                  >
                    {path.charAt(0).toUpperCase() + path.slice(1)}
                  </BreadcrumbLink>
                  <ChevronRight className="h-4 w-4 shrink-0 mx-1" />
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          </div>
          {showDaftarSelector && (
            <Select value={selectedDaftar} onValueChange={setSelectedDaftar}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Daftar" />
              </SelectTrigger>
              <SelectContent>
                {daftarsData.map((daftar) => (
                  <SelectItem key={daftar.id} value={daftar.id}>
                    <div className="flex items-center">
                      <span>{daftar.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({daftar.pitchCount} pitches)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <BookmarkFilter />
          {navActions.map((action: { action: string; icon: any }) => (
            <Button
              key={action.action}
              variant="ghost"
              size="icon"
              onClick={() => handleActionClick(action.action)}
            >
              <action.icon className="h-5 w-5" />
            </Button>
          ))}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-[0.3rem]"
            onClick={() => setProfileOpen(true)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
          </Button>
        </div>
        {showSearch && <SearchAndFilter />}
        <ProfileDialog
          open={profileOpen}
          onOpenChange={setProfileOpen}
        />
        <JournalDialog
          open={journalOpen}
          onOpenChange={setJournalOpen}
        />
        <NotificationDialog
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
        />
        <DaftarDialog
          open={daftarOpen}
          onOpenChange={setDaftarOpen}
        />
      </div>
    </div>
  )
}
