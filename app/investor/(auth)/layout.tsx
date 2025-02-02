import { TopNav } from "@/components/navbar/top-nav";
import ClientSessionProvider from "./client-session"
import { getServerSession } from "next-auth"
import { AppSidebar } from "@/components/navbar/side-nav";
import { DaftarProvider } from "@/lib/context/daftar-context";
import { BookmarkProvider } from "@/lib/context/bookmark-context";
import { SearchProvider } from "@/lib/context/search-context";
import Link from "next/link";

export default async function Layout({ children }: { children: React.ReactNode }) {

    return (
        <>
            <BookmarkProvider>
                <SearchProvider>
                    <DaftarProvider>
                        <ClientSessionProvider>
                            <div className="flex font-poppins bg-[#0e0e0e]">
                                <AppSidebar role="investor" />
                                <div className="w-screen flex flex-col gap-5">
                                    <div className="px-3 border-b">
                                        <TopNav role="investor" />
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
        </>
    )
}