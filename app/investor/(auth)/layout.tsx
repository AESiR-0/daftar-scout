import { TopNav } from "@/components/navbar/top-nav";
import ClientSessionProvider from "./client-session";
import { AppSidebar } from "@/components/navbar/side-nav";
import { DaftarProvider } from "@/lib/context/daftar-context";
import { auth } from "@/auth";
import { BookmarkProvider } from "@/lib/context/bookmark-context";
import { redirect } from "next/navigation";
import { SearchProvider } from "@/lib/context/search-context";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import { ErrorBoundary } from "@/components/error-boundary";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect("/login/investor");
  }
  const user = await db
    .select({ role: users?.role })
    .from(users)
    .where(eq(users?.email, session?.user?.email ?? ""))
    .then((res) => res[0]);

  if (user.role === "temp") {
    redirect("/sign-up/complete");
  }
  if (user.role !== "investor") {
    redirect("/founder");
  }
  return (
    <BookmarkProvider>
      <SearchProvider>
        <DaftarProvider>
          <ClientSessionProvider>
            <ErrorBoundary>
              <div className="flex font-poppins bg-[#0e0e0e]">
                <AppSidebar role="investor" />
                <div className="w-screen flex flex-col">
                  <div className="px-10 border-b">
                    <TopNav role="investor" />
                  </div>
                  <div>{children}</div>
                </div>
              </div>
            </ErrorBoundary>
          </ClientSessionProvider>
        </DaftarProvider>
      </SearchProvider>
    </BookmarkProvider>
  );
}
