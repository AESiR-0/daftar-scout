"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Building2, Users, Cloud } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

const navItems = [
  {
    title: "Daftar's Cloud",
    path: "/landing",
    icon: Cloud,
  },
  {
    title: "Pitch to Investors",
    path: "/landing/founder",
    icon: Building2,
  },
  {
    title: "Scout Startups",
    path: "/landing/investor",
    icon: Users,
  }
]

export function RootSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="w-fit min-h-screen h-full">
      <div className="flex h-full justify-between pb-10 flex-col">
        {/* Top Section */}
        <div>
          {/* Header */}
          <div className="space-y-4 mt-2 px-4 py-2">
            <span className="italic font-semibold text-slate-400"> Beta </span>
          </div>

          {/* Navigation */}
          <div className="px-2 py-1">
            <nav className="space-y-5">
              {navItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => router.push(item.path)}
                  className={cn(
                    "flex items-center justify-start rounded-[0.35rem] px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground w-full",
                    pathname === item.path ? "bg-accent  text-accent-foreground" : "text-muted-foreground",
                    "my-4"
                  )}
                >
                  <span className="text-[14px]">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
} 