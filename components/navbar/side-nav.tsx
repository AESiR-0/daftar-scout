"use client"
import { Building2, ChevronLeft, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { investorNavItems, founderNavItems } from "@/config/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { daftarsData } from "@/lib/dummy-data/daftars"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog"
import { useDaftar } from "@/lib/context/daftar-context"

export function AppSidebar({ role }: { role: string }) {
  const navItems = role === 'investor' ? investorNavItems : founderNavItems
  const Header = role === 'investor' ? 'Investor Platform' : 'Founder Platform'
  const pathname = usePathname()
  const [createDaftarOpen, setCreateDaftarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { selectedDaftar, setSelectedDaftar } = useDaftar()

  const handleDaftarSelect = (value: string) => {
    if (value === "new") {
      setCreateDaftarOpen(true)
    } else {
      setSelectedDaftar(value)
    }
  }

  const selectedDaftarName = daftarsData.find(d => d.id === selectedDaftar)?.name || "Select Daftar"

  return (
    <>
      <div className={cn(
        "border-r bg-[#0e0e0e] min-h-screen relative transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}>
        <div className="flex h-full justify-between pb-10 flex-col">
          {/* Top Section */}
          <div>
            {/* Header */}
            <div className="space-y-4 px-4 py-5">
              <Link href={`${role === 'investor' ? '/investor' : '/founder'}`} className={cn("flex hover:cursor-pointer items-center gap-2 overflow-hidden", isCollapsed && "justify-center")}>
                <Building2 className="h-6 w-6" />
                {!isCollapsed && <h2 className="text-md font-semibold">{Header}</h2>}
              </Link>
            </div>

            {/* Navigation */}
            <div className="px-2">
              <nav className={cn("space-y-3 mt-2", isCollapsed && "space-y-5")}>
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      isCollapsed && "justify-center my-4 flex"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom Section */}
          <div>
            {/* Daftar Selector - Only show for investor role */}
            {!isCollapsed && role === 'investor' && (
              <div className="px-4 mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">{selectedDaftarName}</span>
                      <ChevronLeft className="h-4 w-4 rotate-90 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[210px]" align="start">
                    <DropdownMenuLabel>Your Daftars</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {daftarsData.map((daftar) => (
                      <DropdownMenuItem
                        key={daftar.id}
                        onClick={() => handleDaftarSelect(daftar.id)}
                        className={cn(
                          "cursor-pointer",
                          selectedDaftar === daftar.id && "bg-accent"
                        )}
                      >
                        <span className="truncate">{daftar.name}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDaftarSelect("new")}
                      className="text-blue-500 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Daftar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Collapse Button */}
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
        </div>
      </div>

      <CreateDaftarDialog
        onSuccess={() => {
          setCreateDaftarOpen(false)
        }}
        open={createDaftarOpen}
        onOpenChange={setCreateDaftarOpen}
      />
    </>
  )
}
