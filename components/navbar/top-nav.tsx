"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Play, FileText, Bell, ChevronRight, Folder, ChevronDown, ArrowLeft } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
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

type NavAction = 
  | { icon: any; action: string }
  | { text: string; action: string }

export function TopNav({ role }: { role: string }) {
  const navActions = role === "investor" ? topNavConfig["investor"] : topNavConfig["founder"]
  const pathname = usePathname()
  const router = useRouter()
  const paths = pathname.split('/').filter(Boolean)
  const [profileOpen, setProfileOpen] = useState(false)
  const [journalOpen, setJournalOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [daftarOpen, setDaftarOpen] = useState(false)
  const [hasNewPlay, setHasNewPlay] = useState(true)
  const [hasNewNotifications, setHasNewNotifications] = useState(true)
  const [hasNewProfileUpdates, setHasNewProfileUpdates] = useState(true)
  const [studioEntryPoint, setStudioEntryPoint] = useState<string>("")

  // Only show search on specific pages
  const showSearch = pathname.includes('/scout') ||
    pathname.includes('meetings') ||
    pathname.includes('incubation') ||
    pathname.includes('/daftar') ||
    pathname.includes('/deal-board') ||
    pathname.includes('/studio/collaboration') ||
    pathname.includes('/studio/document')

  // Show daftar selector on deal-board and daftar pages
  const showDaftarSelector = pathname.includes('/deal-board') || pathname.includes('/daftar')

  // Add this effect to track studio entry
  useEffect(() => {
    if (pathname.includes('/studio')) {
      // Only set entry point when first entering studio
      if (!studioEntryPoint) {
        const prevPath = document.referrer
        setStudioEntryPoint(prevPath || '/founder/pitch')
      }
    } else {
      // Reset entry point when leaving studio
      setStudioEntryPoint("")
    }
  }, [pathname])

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

  // Update the back button handler
  const handleBack = () => {
    if (pathname.includes('/founder/studio')) {
      router.push('/founder/pitch')
    } else if (pathname.includes('/investor/studio')) {
      router.push('/investor/scout')
    } else {
      router.back()
    }
  }

  return (
    <div className="">
      <div className="flex h-12 items-center px-4">
        {/* <div className="flex items-center gap-4">
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

        </div> */}
        <div className="flex items-center justify-start gap-3">
          {(pathname.includes('/founder/studio') || 
            pathname.includes('/investor/studio') || 
            pathname.includes('/founder/pitch/') || 
            pathname.includes('/investor/scout/')) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-2 rounded-[0.35rem]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Link 
            href={role === "founder" ? "/founder" : "/investor"}
            className="text-sm font-medium"
          >
            Daftar OS
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {navActions.map((action: NavAction) => (
            <div key={action.action} className="relative">
              <Button
                variant={'icon' in action ? "ghost" : "link"}
                size={'icon' in action ? "icon" : "sm"}
                className={'icon' in action ? "" : "text-foreground rounded-[0.35rem] hover:text-foreground/80 w-fit"}
                onClick={() => handleActionClick(action.action)}
              >
                {'icon' in action ? (
                  <action.icon className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-light">{action.text}</span>
                )}
              </Button>
              {'icon' in action && action.icon === Play && hasNewPlay && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full" />
              )}
              {'icon' in action && action.icon === Bell && hasNewNotifications && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full" />
              )}
            </div>
          ))}

          <div onClick={() => router.push('/founder/pitch')}>
            <BookmarkFilter />
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-[0.35rem]"
              onClick={() => setProfileOpen(true)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </Button>
            {hasNewProfileUpdates && <span className="absolute top-0 right-0 h-2 w-2 bg-blue-500 rounded-full" />}
          </div>
        </div>
        {/* {showSearch && <SearchAndFilter />} */}
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
          role={role as "founder" | "investor" | undefined}
        />
        <DaftarDialog
          open={daftarOpen}
          onOpenChange={setDaftarOpen}
          onSuccess={() => setDaftarOpen(false)}
        />
      </div>
    </div>
  )
}
