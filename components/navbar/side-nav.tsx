"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { investorNavItems, founderNavItems } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getCookie } from "@/lib/helper/cookies";
import { SelectDaftarDialog } from "@/components/dialogs/select-daftar-dialog";
import { CreateDaftarDialog } from "@/components/dialogs/create-daftar-dialog";
import { useDaftar } from "@/lib/context/daftar-context";

interface Daftar {
  id: string;
  name: string;
  description: string;
  profileUrl: string;
}
export function AppSidebar({ role }: { role: string }) {
  const navItems = role === "investor" ? investorNavItems : founderNavItems;
  const pathname = usePathname();
  const { daftars, selectedDaftar, setSelectedDaftar } =
    role === "investor"
      ? useDaftar()
      : {
          setSelectedDaftar: () => console.log("founder"),
          selectedDaftar: "",
          daftars: [
            {
              id: "string",
              name: "string",
              description: "string",
              profileUrl: "string",
            },
          ],
        };
  const [selectDaftarOpen, setSelectDaftarOpen] = useState(false);
  const [createDaftarOpen, setCreateDaftarOpen] = useState(false);
  // const profileUrl = getCookie("profileUrl") || "";
  if (pathname === "/founder/loading") {
    return null;
  } else if (pathname === "/investor/loading") {
    return null;
  }

  const handleCreateDaftar = () => {
    setSelectDaftarOpen(false);
    setCreateDaftarOpen(true);
  };

  return (
    <div className="flex flex-col">
      <div className="border-r bg-[#0e0e0e] w-[60px] h-full">
        <div className="flex h-full justify-between flex-col">
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
                  <Link
                    key={item.title}
                    href={item.url}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.url
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
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
      {role === "investor" && (
        <div className="mx-auto">
          <Button
            size="icon"
            // style={{
            //   background: `url('${profileUrl}')`,
            // }}
            className="rounded-full bg-[#1a1a1a] border-2 border-[#2a2a2a] h-8 w-8"
            onClick={() => setSelectDaftarOpen(true)}
          ></Button>
        </div>
      )}
      {role === "investor" && (
        <SelectDaftarDialog
          open={selectDaftarOpen}
          daftars={daftars}
          onSelect={setSelectedDaftar}
          selected={selectedDaftar}
          onOpenChange={setSelectDaftarOpen}
          onCreateNew={handleCreateDaftar}
        />
      )}
      <CreateDaftarDialog
        open={createDaftarOpen}
        onOpenChange={setCreateDaftarOpen}
        onSuccess={() => setSelectDaftarOpen(true)}
      />
    </div>
  );
}
