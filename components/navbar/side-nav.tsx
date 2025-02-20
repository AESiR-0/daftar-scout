"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { investorNavItems, founderNavItems } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Plus } from "lucide-react"
import { SelectDaftarDialog } from "@/components/dialogs/select-daftar-dialog"
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog"

export function AppSidebar({ role }: { role: string }) {
  const navItems = role === 'investor' ? investorNavItems : founderNavItems
  const pathname = usePathname()
  const [selectDaftarOpen, setSelectDaftarOpen] = useState(false)
  const [createDaftarOpen, setCreateDaftarOpen] = useState(false)

  if (pathname === '/founder/loading') {
    return null
  }
  else if (pathname === '/investor/loading') {
    return null
  }

  const handleCreateDaftar = () => {
    setSelectDaftarOpen(false)
    setCreateDaftarOpen(true)
  }

  return (
    <>
      <div className="border-r bg-[#0e0e0e] w-[60px] min-h-screen">
        <div className="flex h-full justify-between pb-10 flex-col">
          {/* Top Section */}
          <div>
            {/* Header */}
            <div className="space-y-4 px-4 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/public/assets/earth-globe-icon-png.webp" alt="Daftar" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
            </div>

            {/* Navigation */}
            <div className="px-2 py-1">
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
      {role === 'investor' && (
        <div className="absolute bottom-10 left-4">
          <Button 
            size="icon" 
          className="rounded-full bg-[#1a1a1a] border-2 border-[#2a2a2a] h-8 w-8"
          onClick={() => setSelectDaftarOpen(true)}
        >
        
        </Button>
      </div>
      )}

      <SelectDaftarDialog 
        open={selectDaftarOpen}
        onOpenChange={setSelectDaftarOpen}
        onCreateNew={handleCreateDaftar}
      />

      <CreateDaftarDialog
        open={createDaftarOpen}
        onOpenChange={setCreateDaftarOpen}
        onSuccess={() => setSelectDaftarOpen(true)}
      />
    </>
  )
}
