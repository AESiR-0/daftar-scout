"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { investorNavItems, founderNavItems } from "@/config/navigation"
import { Button } from "@/components/ui/button"

export function AppSidebar({ role }: { role: string }) {
  const navItems = role === 'investor' ? investorNavItems : founderNavItems
  const pathname = usePathname()

  if (pathname === '/founder/loading') {
    return null
  }

  return (
    <div className="border-r bg-[#0e0e0e] w-[60px] min-h-screen">
      <div className="flex h-full justify-between pb-10 flex-col">
        {/* Top Section */}
        <div>
          {/* Header */}
          <div className="space-y-4 px-4 py-5">
            <Link
              href={`${role === 'investor' ? '/investor' : '/founder'}`}
              className="flex justify-center items-center"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/public/assets/earth-globe-icon-png.webp" alt="Daftar" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
            </Link>
          </div>

          {/* Navigation */}
          <div className="px-2">
            <nav className="space-y-5">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    "my-4"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-[10px] mt-1">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>

  )
}
