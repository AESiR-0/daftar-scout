import ClientSessionProvider from "./client-session"
import { auth } from '@/app/auth'
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/navbar/side-nav"
import { TopNav } from "@/components/navbar/top-nav";
import { SearchProvider } from "@/lib/context/search-context";
import { BookmarkProvider } from "@/lib/context/bookmark-context"
import { DaftarProvider } from "@/lib/context/daftar-context"

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (session?.status === "loading") {
        return <div>Loading...</div>;
    }

    if (session?.status === "unauthenticated") {
        redirect("/login/founder");
    }

    return (
        <BookmarkProvider>
            <SearchProvider>
                <DaftarProvider>
                    <ClientSessionProvider>
                        <div className="flex  font-poppins bg-[#0e0e0e]">
                            <AppSidebar role="founder" />
                            <div className="w-screen  flex flex-col">
                                <div className="px-10 border-b">
                                    <TopNav role="founder" />
                                </div>
                                <div >
                                    {children}
                                </div>
                            </div>
                        </div>
                    </ClientSessionProvider>
                </DaftarProvider>
            </SearchProvider>
        </BookmarkProvider>
    )
}