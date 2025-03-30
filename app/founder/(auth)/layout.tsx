import ClientSessionProvider from "./client-session";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/navbar/side-nav";
import { TopNav } from "@/components/navbar/top-nav";
import { SearchProvider } from "@/lib/context/search-context";
import { BookmarkProvider } from "@/lib/context/bookmark-context";
import { DaftarProvider } from "@/lib/context/daftar-context";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const user = await db
    .select({ role: users?.role })
    .from(users)
    .where(eq(users?.email, session?.user?.email ?? ""))
    .then((res) => res[0]);

  if (user.role === "temp") {
    redirect("/sign-up/complete");
  }
  if (user.role !== "founder") {
    redirect("/login");
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
                <div>{children}</div>
              </div>
            </div>
          </ClientSessionProvider>
        </DaftarProvider>
      </SearchProvider>
    </BookmarkProvider>
  );
}
