"use client";
import { cn } from "@/lib/utils";
import {
  investorStudioNavItems,
  founderStudioNavItems,
} from "@/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface StudioSidebarProps {
  className?: string;
  mode?: string | null;
  programId?: string | null;
}

export function StudioSidebar({
  className,
  mode,
  programId,
}: StudioSidebarProps) {
  const pathname = usePathname();
  const role = pathname.includes("founder/") ? "founder" : "investor";
  const navItems =
    role === "investor" ? investorStudioNavItems : founderStudioNavItems;

  const createTabUrl = (baseUrl: string) => {
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (programId) params.set("programId", programId);
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className={cn(" w-[15.5rem] h-full", className)}>
      <div className="space-y-4 mx-4 my-8">
        <div className="px-3 py-2 bg-[#1a1a1a] h-[calc(100vh-8rem)] rounded-[0.35rem]">
          <div className="space-y-1">
            {navItems.map((item) => {
              const href = createTabUrl(item.url);
              const isActive = pathname === item.url;

              return (
                <Link
                  key={item.url}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 text-muted-foreground",
                    item.className
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
