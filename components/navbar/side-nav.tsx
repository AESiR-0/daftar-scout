"use client"
import { Building2, ChevronLeft, ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { investorNavItems, founderNavItems } from "@/config/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { daftarsData } from "@/lib/dummy-data/daftars"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog"
import { useDaftar } from "@/lib/context/daftar-context"

export function AppSidebar({ role }: { role: string }) {
  const navItems = role === 'investor' ? investorNavItems : founderNavItems
  const Header = role === 'investor' ? 'Investor Platform' : 'Founder Platform'
  const pathname = usePathname()
  const [createDaftarOpen, setCreateDaftarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { selectedDaftar, setSelectedDaftar } = useDaftar()

  // Show daftar selector on pitch-board and daftar pages
  const showDaftarSelector = pathname.includes('/pitch-board') || pathname.includes('/daftar')

  const handleDaftarSelect = (value: string) => {
    if (value === "new") {
      setCreateDaftarOpen(true)
    } else {
      setSelectedDaftar(value)
    }
  }

  return (
    <>
      <div className={cn(
        "border-r bg-[#0e0e0e] min-h-screen relative transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}>
        <div className="absolute -right-3 top-4">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full border shadow-sm bg-background"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft className={cn(
              "h-3 w-3 transition-transform duration-200",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>

        <div className="flex h-full justify-between pb-10 flex-col">
          {/* Header */}
          <div className="">
            <div className="space-y-4 px-4 py-5">
              <Link href={'/'} className={cn("flex hover:cursor-pointer items-center gap-2 overflow-hidden", isCollapsed && "justify-center")}>
                <Building2 className="h-6 w-6" />
                {!isCollapsed && <h2 className="text-md font-semibold">{Header}</h2>}
              </Link>

            </div>

            {/* Navigation */}
            <div className=" px-2">
              <nav className={cn("space-y-3 mt-2", isCollapsed && "space-y-5")}>
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      isCollapsed && "justify-center my-4 flex "
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    {!isCollapsed && (
                      <span className={cn(
                        "transition-opacity duration-300 overflow-hidden whitespace-nowrap",
                        isCollapsed && "opacity-0"
                      )}>
                        {item.title}
                      </span>)}
                  </Link>
                ))}
              </nav>
            </div></div>
          <div >
            {showDaftarSelector && !isCollapsed && (
              <div className="space-y-2 text-md px-1">
                <Select value={selectedDaftar} onValueChange={handleDaftarSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Daftar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex items-center text-blue-500">
                        <span>Create New Daftar</span>
                      </div>
                    </SelectItem>
                    {daftarsData.map((daftar) => (
                      <SelectItem key={daftar.id} value={daftar.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{daftar.name}</span>

                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}</div>
        </div>
      </div>

      <CreateDaftarDialog
        open={createDaftarOpen}
        onOpenChange={setCreateDaftarOpen}
      />
    </>
  )
}
