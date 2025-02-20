"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Building2, Users, Cloud } from "lucide-react"

type TabType = "cloud" | "founder" | "investor"

interface RootSidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const navItems = [
  {
    title: "Daftar's Cloud",
    id: "cloud" as const,
    icon: Cloud,
  },
  {
    title: "Founder",
    id: "founder" as const,
    icon: Building2,
  },
  {
    title: "Investor",
    id: "investor" as const,
    icon: Users,
  }
]

export function RootSidebar({ activeTab, onTabChange }: RootSidebarProps) {
  return (
    <div className="border-r bg-[#0e0e0e] w-[60px] min-h-screen">
      <div className="flex h-full justify-between pb-10 flex-col">
        {/* Top Section */}
        <div>
          {/* Header */}
          <div className="space-y-4 px-4 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/assets/earth-globe-icon-png.webp" alt="Daftar" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
          </div>

          {/* Navigation */}
          <div className="px-2 py-1">
            <nav className="space-y-5">
              {navItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground w-full",
                    activeTab === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    "my-4"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-[10px] mt-1">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
} 